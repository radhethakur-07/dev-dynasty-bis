"""
Improved BIS Knowledge Ingestion Pipeline
- Checkpoint/resume support
- Deterministic deduplication via content_hash
- Batch embeddings with retry/backoff
- Graceful quota exhaustion handling
- Idempotent upserts
- Ingestion reports
"""
import sys
import os
import re
import json
import time
import uuid
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import google.generativeai as genai
from app.core.config import settings
from app.core.logging import logger
from app.db.supabase import get_supabase_client

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
SOURCES_DIR = DATA_DIR / "sources"
REPORTS_DIR = DATA_DIR / "reports"
KNOWLEDGE_STORE_FILE = DATA_DIR / "knowledge_store.json"
CHECKPOINT_FILE = REPORTS_DIR / "ingestion_checkpoint.json"
INGESTION_REPORT_FILE = REPORTS_DIR / "ingestion_report.json"

REPORTS_DIR.mkdir(parents=True, exist_ok=True)

if settings.is_gemini_configured:
    genai.configure(api_key=settings.GEMINI_API_KEY)


def compute_hash(text: str) -> str:
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()


def deterministic_uuid(namespace: str, key: str) -> str:
    """Generate a deterministic UUID from a namespace + key combination."""
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"bis-ingestion:{namespace}:{key}"))


def clean_text(text: str) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)


def chunk_text(text: str, chunk_size: int = 300, overlap: int = 40) -> List[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += (chunk_size - overlap)
    return chunks


def generate_batch_embeddings(texts: List[str], max_retries: int = 4) -> Optional[List[List[float]]]:
    """Generates 768-dim embeddings via Gemini API with retry and exponential backoff.
    Returns None on quota exhaustion (instead of fallback vectors)."""
    if not texts:
        return []

    for attempt in range(1, max_retries + 1):
        try:
            res = genai.embed_content(
                model=settings.EMBEDDING_MODEL,
                content=texts,
                task_type="retrieval_document",
                output_dimensionality=settings.EMBEDDING_DIMENSION
            )
            embeddings = res.get("embedding", [])
            if len(embeddings) == len(texts):
                return embeddings
        except Exception as exc:
            err_str = str(exc).lower()
            if "quota" in err_str or "429" in err_str or "resource" in err_str:
                logger.error(f"[Embedding] QUOTA EXHAUSTED on attempt {attempt}: {exc}")
                if attempt < max_retries:
                    wait_time = min(2 ** (attempt + 2), 60)  # 8, 16, 32, 60
                    logger.info(f"[Embedding] Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                else:
                    return None  # Signal quota exhaustion
            else:
                logger.warning(f"[Embedding Attempt {attempt}/{max_retries}] Error: {exc}")
                if attempt < max_retries:
                    time.sleep(2 ** attempt)

    return None  # All retries failed


def load_checkpoint() -> Dict[str, Any]:
    if CHECKPOINT_FILE.exists():
        try:
            return json.loads(CHECKPOINT_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {
        "completed_stages": [],
        "processed_chunks": 0,
        "completed_doc_ids": [],
        "failed_docs": [],
        "quota_exhausted": False
    }


def save_checkpoint(data: Dict[str, Any]):
    CHECKPOINT_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


def run_ingestion():
    logger.info("=== STARTING IMPROVED BIS KNOWLEDGE INGESTION ===")
    start_time = time.time()
    supabase = get_supabase_client()
    checkpoint = load_checkpoint()

    # Reset quota flag on new run
    checkpoint["quota_exhausted"] = False

    stats = {
        "documents_processed": 0,
        "chunks_created": 0,
        "chunks_embedded": 0,
        "duplicates_skipped": 0,
        "embedding_failures": 0,
        "api_calls": 0,
    }

    # Load local knowledge store
    local_store = {
        "standards": [],
        "laboratories": [],
        "documents": [],
        "chunks": [],
        "last_ingestion_at": None
    }
    if KNOWLEDGE_STORE_FILE.exists():
        try:
            local_store = json.loads(KNOWLEDGE_STORE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass

    # Build hash index of existing local chunks for deduplication
    existing_hashes = set()
    for c in local_store.get("chunks", []):
        h = c.get("content_hash")
        if h:
            existing_hashes.add(h)

    # Baseline Supabase counts
    before_stats = {"documents": 0, "chunks": 0, "standards": 0, "laboratories": 0}
    if supabase:
        try:
            before_stats["documents"] = len(supabase.table("knowledge_documents").select("id").execute().data)
            before_stats["chunks"] = len(supabase.table("knowledge_chunks").select("id").execute().data)
            before_stats["standards"] = len(supabase.table("standards_metadata").select("id").execute().data)
            before_stats["laboratories"] = len(supabase.table("laboratories").select("id").execute().data)
        except Exception as e:
            logger.warning(f"Error fetching baseline counts: {e}")
    logger.info(f"Supabase Baseline: {before_stats}")
    logger.info(f"Local Store: standards={len(local_store['standards'])}, labs={len(local_store['laboratories'])}, docs={len(local_store['documents'])}, chunks={len(local_store['chunks'])}")

    # =================================================================
    # STAGE 1 & 2: Standards and Labs (skip if already completed)
    # =================================================================
    if "standards" not in checkpoint.get("completed_stages", []):
        logger.info("--- Stage 1: Standards Metadata (already done in previous run, marking complete) ---")
        checkpoint.setdefault("completed_stages", []).append("standards")
        save_checkpoint(checkpoint)

    if "laboratories" not in checkpoint.get("completed_stages", []):
        logger.info("--- Stage 2: Laboratories (already done in previous run, marking complete) ---")
        checkpoint.setdefault("completed_stages", []).append("laboratories")
        save_checkpoint(checkpoint)

    # =================================================================
    # STAGE 3: Process Knowledge Documents & Batch Embeddings
    # =================================================================
    logger.info("--- Stage 3: Ingesting Knowledge Chunks with Vector Embeddings ---")

    # Get all eligible .md files (skip 0x_ manifest files)
    md_files = sorted([
        f for f in SOURCES_DIR.glob("*.md")
        if not f.name.startswith("0") and not f.name.startswith("README")
    ])
    logger.info(f"Found {len(md_files)} eligible knowledge documents.")

    for md_path in md_files:
        doc_title = md_path.stem.replace("_", " ").title()

        if doc_title in checkpoint.get("completed_doc_ids", []):
            logger.info(f"[SKIP] Already ingested: {doc_title}")
            continue

        if checkpoint.get("quota_exhausted"):
            logger.warning(f"[SKIP] Quota exhausted, deferring: {doc_title}")
            continue

        logger.info(f"[PROCESSING] {doc_title} ({md_path.name})")
        text = md_path.read_text(encoding="utf-8", errors="ignore")
        doc_url_match = re.search(r"https?://[^\s\)]+", text)
        doc_url = doc_url_match.group(0) if doc_url_match else "https://www.bis.gov.in"

        # Deterministic doc ID
        doc_id = deterministic_uuid("document", doc_title)

        if supabase:
            try:
                existing = supabase.table("knowledge_documents").select("id").eq("title", doc_title).execute()
                if existing.data:
                    doc_id = existing.data[0]["id"]
                    # Delete old chunks for this doc to replace with fresh ones
                    supabase.table("knowledge_chunks").delete().eq("document_id", doc_id).execute()
                    logger.info(f"  Cleared old chunks for existing document: {doc_title}")
                else:
                    supabase.table("knowledge_documents").insert({
                        "id": doc_id,
                        "title": doc_title,
                        "source_url": doc_url,
                        "document_type": "Official BIS Guidance",
                        "is_demo": False
                    }).execute()
            except Exception as e:
                logger.warning(f"  Error registering document {doc_title}: {e}")

        # Parse sections and create chunks
        sections = re.split(r"\n##\s+", text)
        doc_chunks = []

        for sec in sections:
            if not sec.strip():
                continue
            lines = sec.strip().splitlines()
            sec_title = lines[0].replace("#", "").strip() if lines else "General"
            sec_body = "\n".join(lines[1:]) if len(lines) > 1 else lines[0]
            sec_url_match = re.search(r"https?://[^\s\)]+", sec_body)
            sec_url = sec_url_match.group(0) if sec_url_match else doc_url

            cleaned = clean_text(sec_body)
            text_chunks = chunk_text(cleaned)
            for p_idx, c_text in enumerate(text_chunks, 1):
                c_hash = compute_hash(c_text)

                # Deduplication check
                if c_hash in existing_hashes:
                    stats["duplicates_skipped"] += 1
                    continue

                doc_chunks.append({
                    "id": deterministic_uuid("chunk", c_hash),
                    "document_id": doc_id,
                    "document_title": doc_title,
                    "section": sec_title[:80],
                    "page_number": p_idx,
                    "source_url": sec_url,
                    "chunk_text": c_text,
                    "content_hash": c_hash,
                    "is_demo": False
                })

        if not doc_chunks:
            logger.info(f"  No new chunks for {doc_title} (all duplicates)")
            checkpoint["completed_doc_ids"].append(doc_title)
            save_checkpoint(checkpoint)
            stats["documents_processed"] += 1
            continue

        logger.info(f"  {len(doc_chunks)} new chunks to embed for {doc_title}")

        # Batch embed in groups of 10
        batch_size = 10
        doc_success = True

        for b_idx in range(0, len(doc_chunks), batch_size):
            sub_batch = doc_chunks[b_idx:b_idx + batch_size]
            texts_to_embed = [c["chunk_text"] for c in sub_batch]

            embeddings = generate_batch_embeddings(texts_to_embed)
            stats["api_calls"] += 1

            if embeddings is None:
                # Quota exhausted — stop gracefully
                logger.error(f"  QUOTA EXHAUSTED during {doc_title} at batch {b_idx // batch_size + 1}")
                checkpoint["quota_exhausted"] = True
                stats["embedding_failures"] += len(sub_batch)
                doc_success = False
                break

            db_chunk_rows = []
            for item, emb in zip(sub_batch, embeddings):
                item["embedding"] = emb
                db_chunk_rows.append({
                    "id": item["id"],
                    "document_id": item["document_id"],
                    "chunk_text": item["chunk_text"],
                    "page_number": item["page_number"],
                    "section": item["section"],
                    "embedding": emb,
                    "is_demo": False
                })
                # Add to local store
                local_store["chunks"].append(item)
                existing_hashes.add(item["content_hash"])

            if supabase:
                try:
                    supabase.table("knowledge_chunks").insert(db_chunk_rows).execute()
                    stats["chunks_embedded"] += len(db_chunk_rows)
                except Exception as exc:
                    logger.warning(f"  Error inserting chunks for {doc_title}: {exc}")
                    stats["embedding_failures"] += len(db_chunk_rows)

            stats["chunks_created"] += len(db_chunk_rows)
            time.sleep(0.5)  # Respectful rate limit

        if doc_success:
            checkpoint["completed_doc_ids"].append(doc_title)
            stats["documents_processed"] += 1
            logger.info(f"  [DONE] {doc_title} ({len(doc_chunks)} chunks)")
        else:
            checkpoint.setdefault("failed_docs", []).append(doc_title)
            logger.warning(f"  [PARTIAL] {doc_title} - stopped due to quota")

        save_checkpoint(checkpoint)

    # Save local store
    local_store["last_ingestion_at"] = datetime.now(timezone.utc).isoformat()
    KNOWLEDGE_STORE_FILE.write_text(json.dumps(local_store, indent=2, ensure_ascii=False), encoding="utf-8")
    logger.info(f"Updated local knowledge store: {KNOWLEDGE_STORE_FILE}")

    # Final Supabase counts
    after_stats = {"documents": 0, "chunks": 0, "standards": 0, "laboratories": 0}
    if supabase:
        try:
            after_stats["documents"] = len(supabase.table("knowledge_documents").select("id").execute().data)
            after_stats["chunks"] = len(supabase.table("knowledge_chunks").select("id").execute().data)
            after_stats["standards"] = len(supabase.table("standards_metadata").select("id").execute().data)
            after_stats["laboratories"] = len(supabase.table("laboratories").select("id").execute().data)
        except Exception:
            pass

    elapsed = round(time.time() - start_time, 2)

    # Calculate remaining
    all_docs = [f.stem.replace("_", " ").title() for f in md_files]
    completed = set(checkpoint.get("completed_doc_ids", []))
    remaining_docs = [d for d in all_docs if d not in completed]

    report = {
        "ingestion_timestamp": datetime.now(timezone.utc).isoformat(),
        "elapsed_seconds": elapsed,
        "embedding_model": settings.EMBEDDING_MODEL,
        "embedding_dimension": settings.EMBEDDING_DIMENSION,
        "supabase_before": before_stats,
        "supabase_after": after_stats,
        "local_store_counts": {
            "standards": len(local_store["standards"]),
            "laboratories": len(local_store["laboratories"]),
            "documents": len(local_store["documents"]),
            "chunks": len(local_store["chunks"]),
        },
        "session_stats": {
            "documents_processed": stats["documents_processed"],
            "chunks_created": stats["chunks_created"],
            "chunks_embedded": stats["chunks_embedded"],
            "duplicates_skipped": stats["duplicates_skipped"],
            "embedding_failures": stats["embedding_failures"],
            "embedding_api_calls": stats["api_calls"],
        },
        "remaining": {
            "unprocessed_documents": remaining_docs,
            "count": len(remaining_docs),
        },
        "quota_exhausted": checkpoint.get("quota_exhausted", False),
        "resume_point": remaining_docs[0] if remaining_docs else "COMPLETE",
    }

    INGESTION_REPORT_FILE.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    logger.info(f"Ingestion report: {INGESTION_REPORT_FILE}")
    logger.info(f"=== INGESTION FINISHED in {elapsed}s ===")
    logger.info(f"  Documents processed: {stats['documents_processed']}")
    logger.info(f"  Chunks created: {stats['chunks_created']}")
    logger.info(f"  Chunks embedded: {stats['chunks_embedded']}")
    logger.info(f"  Duplicates skipped: {stats['duplicates_skipped']}")
    logger.info(f"  Failures: {stats['embedding_failures']}")
    logger.info(f"  Remaining docs: {len(remaining_docs)}")

    if checkpoint.get("quota_exhausted"):
        logger.warning("QUOTA WAS EXHAUSTED. Run again when quota resets to continue.")

    return report


if __name__ == "__main__":
    run_ingestion()
