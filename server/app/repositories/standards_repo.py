import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Set
from app.db.supabase import get_supabase_client
from app.core.logging import logger
from scripts.ingestion.sample_demo_data import DEMO_STANDARDS

KNOWLEDGE_STORE_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "knowledge_store.json"

STOPWORDS: Set[str] = {
    "what", "is", "the", "a", "an", "for", "in", "of", "to", "on", "with", "and", "or",
    "standard", "standards", "indian", "applies", "applicable", "apply", "requirement",
    "requirements", "specification", "specifications", "please", "tell", "me", "which",
    "give", "code", "number", "product", "products", "find", "search", "show", "can", "you",
    "about", "how", "details", "info", "information", "does", "do", "any", "related", "like",
    "under", "मानक", "है", "क्या", "के", "लिए", "बताओ", "लागू", "होने", "वाले", "बारे", "में"
}

MIN_RELEVANCE_SCORE = 0.60


class StandardsRepository:
    def __init__(self):
        self.supabase = get_supabase_client()
        self._local_cache: Dict[str, Dict[str, Any]] = {}
        if KNOWLEDGE_STORE_FILE.exists():
            try:
                with open(KNOWLEDGE_STORE_FILE, "r", encoding="utf-8") as f:
                    store = json.load(f)
                    for std in store.get("standards", []):
                        self._local_cache[std.get("code", "")] = std
            except Exception as e:
                logger.warning(f"Error loading local knowledge store cache: {e}")

    def _extract_product_tokens(self, text: str) -> List[str]:
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        raw_words = cleaned.split()
        tokens = []
        for w in raw_words:
            if w not in STOPWORDS and len(w) > 1:
                # Basic singularization for plural search queries (e.g. cookers -> cooker, toys -> toy)
                normalized = w[:-1] if w.endswith("s") and len(w) > 3 and not w.endswith("ss") else w
                tokens.append(normalized)
        return tokens

    def _compute_relevance(
        self,
        std: Dict[str, Any],
        query: str,
        product_tokens: List[str],
        category: Optional[str] = None,
        material: Optional[str] = None,
        intended_use: Optional[str] = None
    ) -> float:
        title = std.get("title", "").lower()
        code = std.get("code", "").lower()
        reason = std.get("reason", "").lower()
        std_category = std.get("category", "").lower()
        lower_query = query.lower()

        # 1. Direct standard code match (e.g. "IS 2347", "9873", "IS 14543")
        if code in lower_query or code.replace(" ", "") in lower_query.replace(" ", ""):
            return 1.0
        
        code_digits_match = re.search(r"is\s*(\d+)", code)
        if code_digits_match:
            base_num = code_digits_match.group(1)
            if base_num in lower_query:
                return 1.0

        # Cross-category contradiction penalty: if category is specified and directly contradicts
        if category and std_category:
            cat_lower = category.lower()
            if ("food" in cat_lower and ("toy" in std_category or "electric" in std_category or "mechanical" in std_category)) or \
               ("toy" in cat_lower and ("food" in std_category or "electric" in std_category or "mechanical" in std_category)) or \
               ("electric" in cat_lower and ("food" in std_category or "toy" in std_category)):
                return 0.0

        # 2. Check exact multi-word phrase match in title or category
        base_score = 0.0
        if len(product_tokens) >= 2:
            exact_phrase = " ".join(product_tokens)
            if exact_phrase in title or exact_phrase in std_category:
                base_score = 0.95

        # 3. Token match ratio if not an exact phrase
        if base_score == 0.0 and product_tokens:
            matched_tokens = 0
            for t in product_tokens:
                # Match token in title, reason/scope, or category
                if t in title or (reason and t in reason) or (std_category and t in std_category):
                    matched_tokens += 1

            ratio = matched_tokens / len(product_tokens)
            if ratio >= 0.70:
                base_score = 0.85
            elif ratio >= 0.40:
                base_score = 0.65
            elif ratio > 0:
                base_score = 0.30

        if base_score == 0.0:
            return 0.0

        # Contextual boosts for material, intended use, and category alignment
        boost = 0.0
        if category and category.lower() in std_category:
            boost += 0.05
        if material and ((material.lower() in title) or (reason and material.lower() in reason)):
            boost += 0.05
        if intended_use and ((intended_use.lower() in title) or (reason and intended_use.lower() in reason)):
            boost += 0.05

        return min(1.0, base_score + boost)

    def search_standards(
        self,
        query: str,
        product: Optional[str] = None,
        category: Optional[str] = None,
        material: Optional[str] = None,
        intended_use: Optional[str] = None,
        description: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        # Consolidate rich product search context
        search_phrase = f"{product or ''} {category or ''} {material or ''} {intended_use or ''} {description or ''} {query}".strip()
        product_tokens = self._extract_product_tokens(f"{product or ''} {query}")

        candidates: List[Dict[str, Any]] = []

        # 1. Fetch candidates from live Supabase if available
        if self.supabase:
            try:
                response = self.supabase.table("standards_metadata").select("*").limit(25).execute()
                if response.data:
                    # Merge each Supabase record with cached scope_summary/reason
                    for row in response.data:
                        code_key = row.get("code", "")
                        local_match = self._local_cache.get(code_key, {})
                        merged = dict(row)
                        if "reason" not in merged or not merged["reason"]:
                            merged["reason"] = local_match.get("reason", local_match.get("scope_summary", ""))
                        candidates.append(merged)
            except Exception as exc:
                logger.warning(f"Error querying Supabase standards: {exc}.")

        # 2. Fallback to local verified store if Supabase returned nothing
        if not candidates and self._local_cache:
            candidates = list(self._local_cache.values())

        # 3. Fallback to sample demo standards only if no candidate store exists
        if not candidates:
            candidates = DEMO_STANDARDS

        total_evaluated = len(candidates)
        scored_candidates = []
        filtered_out_count = 0

        for std in candidates:
            score = self._compute_relevance(
                std=std,
                query=search_phrase,
                product_tokens=product_tokens,
                category=category,
                material=material,
                intended_use=intended_use
            )
            if score >= MIN_RELEVANCE_SCORE:
                scored_std = dict(std)
                scored_std["relevance_score"] = score
                scored_candidates.append(scored_std)
            else:
                filtered_out_count += 1

        # Sort descending by relevance score
        scored_candidates.sort(key=lambda x: x.get("relevance_score", 0.0), reverse=True)

        passed_summary = [f"{c.get('code')}: {c.get('relevance_score', 0.0):.2f}" for c in scored_candidates]
        logger.info(
            f"[DIAGNOSTIC RETRIEVAL] Product: '{product}' | Query: '{query}' | "
            f"Attributes: cat={category}, mat={material}, use={intended_use} | "
            f"Product Tokens: {product_tokens} | "
            f"Candidates Evaluated: {total_evaluated} | "
            f"Passed Threshold (>={MIN_RELEVANCE_SCORE}): {len(scored_candidates)} | "
            f"Filtered-Out Irrelevant Count: {filtered_out_count} | "
            f"Passed: {passed_summary}"
        )

        return scored_candidates


standards_repo = StandardsRepository()
