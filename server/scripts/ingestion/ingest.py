"""
BIS Knowledge Ingestion Pipeline.

CRITICAL ARCHITECTURE RULE:
This pipeline is strictly decoupled from the runtime chat server.
It is executed as an administrative CLI tool to ingest, clean, chunk,
and embed verified BIS official documents into Supabase PostgreSQL + pgvector.

Usage:
    python -m scripts.ingestion.ingest --source <path_or_url>
"""

import argparse
import sys
from typing import Dict, List, Optional
from app.core.config import settings
from app.core.logging import logger
from app.db.supabase import get_supabase_client
from scripts.ingestion.sample_demo_data import DEMO_STANDARDS, DEMO_LABORATORIES, DEMO_NOTICE


def clean_text(text: str) -> str:
    """Normalizes whitespace and removes unwanted control characters."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Splits document text into manageable overlapping chunks for vector embedding."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += (chunk_size - overlap)
    return chunks


def seed_demo_data_to_supabase():
    """
    Optional helper to seed demo data into Supabase if configured,
    strictly marking every row with is_demo=True and the explicit demo badge.
    """
    supabase = get_supabase_client()
    if not supabase:
        logger.info("Supabase not connected. Skipping database seeding.")
        return

    logger.info("Seeding demo records into Supabase (strictly marked as demo)...")
    for std in DEMO_STANDARDS:
        try:
            supabase.table("standards_metadata").upsert({
                "code": std["code"],
                "title": std["title"],
                "category": std["category"],
                "status": std["status"],
                "source_url": std["source_url"],
                "is_demo": True
            }).execute()
        except Exception as e:
            logger.warning(f"Error seeding standard {std['code']}: {e}")

    for lab in DEMO_LABORATORIES:
        try:
            supabase.table("laboratories").upsert({
                "name": lab["name"],
                "location": lab["location"],
                "state": lab.get("state"),
                "categories": lab.get("categories", []),
                "scope_of_testing": lab.get("scope_of_testing"),
                "recognition_status": lab.get("recognition_status"),
                "source_url": lab.get("source_url"),
                "is_demo": True
            }).execute()
        except Exception as e:
            logger.warning(f"Error seeding laboratory {lab['name']}: {e}")

    logger.info("Demo seeding completed successfully.")


def main():
    parser = argparse.ArgumentParser(description="BIS Document Ingestion CLI")
    parser.add_argument("--source", type=str, help="Path to document file or official URL")
    parser.add_argument("--document-type", type=str, default="Standard", help="Document type (e.g. Standard, Scheme, Notification)")
    parser.add_argument("--seed-demo", action="store_true", help="Seed initial demo dataset into Supabase")

    args = parser.parse_args()

    if args.seed_demo:
        seed_demo_data_to_supabase()
        return

    if not args.source:
        print("\n[ACTION REQUIRED]: Please provide a verified source document or URL via --source.")
        print("Example: python -m scripts.ingestion.ingest --source path/to/is_document.pdf\n")
        sys.exit(1)

    logger.info(f"Beginning ingestion for source: {args.source}")
    print(f"Ingestion skeleton ready for: {args.source}")


if __name__ == "__main__":
    main()
