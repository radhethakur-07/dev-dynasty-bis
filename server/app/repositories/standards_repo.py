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
    "under", "मानक", "है", "क्या", "के", "लिए", "बताओ", "लागू", "होने", "वाले"
}

MIN_RELEVANCE_SCORE = 0.60


class StandardsRepository:
    def __init__(self):
        self.supabase = get_supabase_client()

    def _extract_product_tokens(self, text: str) -> List[str]:
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        raw_words = cleaned.split()
        tokens = []
        for w in raw_words:
            if w not in STOPWORDS and len(w) > 1:
                # Basic singularization for plural search queries (e.g. cookers -> cooker)
                normalized = w[:-1] if w.endswith("s") and len(w) > 3 and not w.endswith("ss") else w
                tokens.append(normalized)
        return tokens

    def _compute_relevance(self, std: Dict[str, Any], query: str, product_tokens: List[str]) -> float:
        title = std.get("title", "").lower()
        code = std.get("code", "").lower()
        reason = std.get("reason", "").lower()
        category = std.get("category", "").lower()
        lower_query = query.lower()

        # 1. Direct standard code match (e.g. "IS 2347" in query)
        if code in lower_query or code.replace(" ", "") in lower_query.replace(" ", ""):
            return 1.0

        # 2. Check exact multi-word phrase match in title (e.g. "pressure cooker" in title)
        if len(product_tokens) >= 2:
            exact_phrase = " ".join(product_tokens)
            if exact_phrase in title:
                return 0.95

        # 3. Token match ratio
        if not product_tokens:
            return 0.0

        matched_tokens = 0
        for t in product_tokens:
            if t in title or (t in reason and len(t) > 3) or (t in category and len(t) > 3):
                matched_tokens += 1

        ratio = matched_tokens / len(product_tokens)
        if ratio >= 0.75:
            return 0.85
        elif ratio >= 0.50:
            return 0.65
        elif ratio > 0:
            return 0.30
        return 0.0

    def search_standards(self, query: str, product: Optional[str] = None) -> List[Dict[str, Any]]:
        search_phrase = f"{product or ''} {query}".strip()
        product_tokens = self._extract_product_tokens(search_phrase)

        candidates: List[Dict[str, Any]] = []

        # 1. Fetch candidates from live Supabase if available
        if self.supabase:
            try:
                # Broad fetch from Supabase to filter locally by strict relevance
                response = self.supabase.table("standards_metadata").select("*").limit(20).execute()
                if response.data:
                    candidates = response.data
            except Exception as exc:
                logger.warning(f"Error querying Supabase standards: {exc}.")

        # 2. Fallback to local verified store if Supabase returned nothing
        if not candidates and KNOWLEDGE_STORE_FILE.exists():
            try:
                with open(KNOWLEDGE_STORE_FILE, "r", encoding="utf-8") as f:
                    store = json.load(f)
                    candidates = store.get("standards", [])
            except Exception as e:
                logger.warning(f"Error reading local knowledge store: {e}")

        # 3. Fallback to sample demo standards only if no candidates exist
        if not candidates:
            candidates = DEMO_STANDARDS

        total_evaluated = len(candidates)
        scored_candidates = []
        filtered_out_count = 0

        for std in candidates:
            score = self._compute_relevance(std, search_phrase, product_tokens)
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
            f"[DIAGNOSTIC RETRIEVAL] Query: '{query}' | "
            f"Extracted Product Tokens: {product_tokens} | "
            f"Candidates Evaluated: {total_evaluated} | "
            f"Passed Threshold (>={MIN_RELEVANCE_SCORE}): {len(scored_candidates)} | "
            f"Filtered-Out Irrelevant Count: {filtered_out_count} | "
            f"Passed: {passed_summary}"
        )

        return scored_candidates


standards_repo = StandardsRepository()
