"""
BIS Knowledge Ingestion Pipeline.

Parses, cleans, chunks, and indexes authentic BIS source material from server/data/sources/
into the verified knowledge store (server/data/knowledge_store.json) and Supabase PostgreSQL + pgvector.

Preserves exact source URLs, sections, provenance metadata, and strictly sets is_demo=False.
"""

import argparse
import csv
import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime
from app.core.config import settings
from app.core.logging import logger
from app.db.supabase import get_supabase_client
from app.services.rag_service import rag_service

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
SOURCES_DIR = DATA_DIR / "sources"
KNOWLEDGE_STORE_FILE = DATA_DIR / "knowledge_store.json"


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


def load_local_knowledge_store() -> Dict[str, Any]:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if KNOWLEDGE_STORE_FILE.exists():
        try:
            with open(KNOWLEDGE_STORE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "standards": [],
        "laboratories": [],
        "documents": [],
        "chunks": [],
        "last_ingestion_at": None
    }


def save_local_knowledge_store(data: Dict[str, Any]):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    data["last_ingestion_at"] = datetime.utcnow().isoformat()
    with open(KNOWLEDGE_STORE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.info(f"Verified knowledge store updated: {KNOWLEDGE_STORE_FILE}")


def ingest_standards_csv(filepath: Path, store: Dict[str, Any], supabase=None):
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            code = row.get("standard_code") or row.get("code")
            if not code:
                continue
            entry = {
                "code": code.strip(),
                "title": row.get("title", "").strip(),
                "category": (row.get("product_category") or row.get("category", "General")).strip(),
                "status": "Active",
                "reason": (row.get("scope_summary") or row.get("reason", "")).strip(),
                "source_url": row.get("source_url", "https://services.bis.gov.in/").strip(),
                "source_status": row.get("source_status", "Official BIS source").strip(),
                "is_demo": False,
                "ingested_at": datetime.utcnow().isoformat()
            }
            store["standards"] = [s for s in store["standards"] if s["code"] != entry["code"]]
            store["standards"].append(entry)
            count += 1

            if supabase:
                try:
                    supabase.table("standards_metadata").upsert({
                        "code": entry["code"],
                        "title": entry["title"],
                        "category": entry["category"],
                        "status": entry["status"],
                        "source_url": entry["source_url"],
                        "is_demo": False
                    }).execute()
                except Exception as e:
                    logger.warning(f"Error inserting standard {entry['code']} to Supabase: {e}")

        logger.info(f"Ingested {count} standard records from {filepath.name}")
        return count


def ingest_laboratories_csv(filepath: Path, store: Dict[str, Any], supabase=None):
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            name = row.get("lab_name") or row.get("name")
            if not name:
                continue
            loc = row.get("location", "").strip()
            state = None
            if " " in loc and any(s in loc for s in ["Pradesh", "Telangana", "Delhi"]):
                parts = loc.rsplit(" ", 1)
                loc_city = parts[0]
                state = parts[1]
            else:
                loc_city = loc

            entry = {
                "name": name.strip(),
                "location": loc,
                "state": state or loc,
                "lab_code": row.get("lab_code", "").strip(),
                "validity_date": row.get("validity_date", "").strip(),
                "scope_of_testing": f"Validity: {row.get('validity_date', 'Active')} (Lab Code: {row.get('lab_code', 'N/A')})",
                "recognition_status": "BIS LIMS Recognized",
                "source_url": row.get("source_url", "https://lims.bis.gov.in/home/labs/").strip(),
                "source_status": row.get("source_status", "Official BIS LIMS").strip(),
                "is_demo": False,
                "ingested_at": datetime.utcnow().isoformat()
            }
            store["laboratories"] = [l for l in store["laboratories"] if l["name"] != entry["name"]]
            store["laboratories"].append(entry)
            count += 1

            if supabase:
                try:
                    supabase.table("laboratories").upsert({
                        "name": entry["name"],
                        "location": entry["location"],
                        "state": entry["state"],
                        "scope_of_testing": entry["scope_of_testing"],
                        "recognition_status": entry["recognition_status"],
                        "source_url": entry["source_url"],
                        "is_demo": False
                    }).execute()
                except Exception as e:
                    logger.warning(f"Error inserting lab {entry['name']} to Supabase: {e}")

        logger.info(f"Ingested {count} laboratory records from {filepath.name}")
        return count


def ingest_markdown_doc(filepath: Path, store: Dict[str, Any], supabase=None):
    text = filepath.read_text(encoding="utf-8", errors="ignore")
    doc_title = filepath.stem.replace("_", " ").title()

    # Extract primary doc URL if present
    doc_url_match = re.search(r"https?://[^\s\)]+", text)
    doc_url = doc_url_match.group(0) if doc_url_match else "https://www.bis.gov.in"

    doc_id = str(len(store["documents"]) + 1)
    store["documents"] = [d for d in store["documents"] if d["title"] != doc_title]
    store["documents"].append({
        "id": doc_id,
        "title": doc_title,
        "source_url": doc_url,
        "filename": filepath.name,
        "is_demo": False
    })

    # Section-based chunking
    sections = re.split(r"\n##\s+", text)
    chunk_count = 0

    for sec in sections:
        if not sec.strip():
            continue
        lines = sec.strip().splitlines()
        sec_title = lines[0].replace("#", "").strip() if lines else "General"
        sec_body = "\n".join(lines[1:]) if len(lines) > 1 else lines[0]
        
        sec_url_match = re.search(r"https?://[^\s\)]+", sec_body)
        sec_url = sec_url_match.group(0) if sec_url_match else doc_url

        cleaned = clean_text(sec_body)
        chunks = chunk_text(cleaned)

        for p_idx, c_text in enumerate(chunks, 1):
            embedding = rag_service.get_query_embedding(c_text)
            chunk_entry = {
                "document_id": doc_id,
                "document_title": doc_title,
                "section": sec_title,
                "page_number": p_idx,
                "source_url": sec_url,
                "chunk_text": c_text,
                "embedding": embedding,
                "is_demo": False,
                "ingested_at": datetime.utcnow().isoformat()
            }
            store["chunks"].append(chunk_entry)
            chunk_count += 1

            if supabase:
                try:
                    supabase.table("knowledge_chunks").insert({
                        "document_id": doc_id,
                        "chunk_text": chunk_entry["chunk_text"],
                        "page_number": chunk_entry["page_number"],
                        "section": chunk_entry["section"],
                        "embedding": chunk_entry["embedding"],
                        "is_demo": False
                    }).execute()
                except Exception as e:
                    logger.warning(f"Error inserting chunk to Supabase: {e}")

    logger.info(f"Ingested document {filepath.name}: created {chunk_count} chunk(s) with embeddings.")
    return chunk_count


def run_full_bundle_ingestion():
    if not SOURCES_DIR.exists():
        print(f"Sources directory {SOURCES_DIR} does not exist.")
        return

    supabase = get_supabase_client()
    store = load_local_knowledge_store()

    # Reset previously ingested chunks to avoid duplicate accumulation
    store["chunks"] = []

    print("\n--- BEGINNING BIS KNOWLEDGE INGESTION ---")
    
    # 1. Standards
    std_file = SOURCES_DIR / "standards.csv"
    if std_file.exists():
        std_count = ingest_standards_csv(std_file, store, supabase)
        print(f"[OK] Standards parsed & ingested: {std_count} records from {std_file.name}")

    # 2. Laboratories
    lab_file = SOURCES_DIR / "laboratories.csv"
    if lab_file.exists():
        lab_count = ingest_laboratories_csv(lab_file, store, supabase)
        print(f"[OK] Laboratories parsed & ingested: {lab_count} records from {lab_file.name}")

    # 3. Documents (Schemes, Hallmarking, FAQs)
    doc_files = [
        SOURCES_DIR / "certification_schemes.md",
        SOURCES_DIR / "hallmarking_guide.md",
        SOURCES_DIR / "consumer_faqs.md"
    ]
    for df in doc_files:
        if df.exists():
            c_cnt = ingest_markdown_doc(df, store, supabase)
            print(f"[OK] Document parsed & chunked: {df.name} -> {c_cnt} chunk(s) embedded")

    save_local_knowledge_store(store)
    print("--- INGESTION BUNDLE PROCESSED SUCCESSFULLY ---\n")


if __name__ == "__main__":
    run_full_bundle_ingestion()
