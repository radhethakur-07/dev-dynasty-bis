"""
Clean and repair corrupted knowledge store chunks and discovered Scheme I products.
Fixes:
1. Removes corrupted 'Cement (any variety of cement manufactured or sold in India) such as' prefix from Scheme I chunks.
2. Extracts accurate, product-specific sections and standard codes for each chunk.
3. Fixes generic source URLs to point to official BIS / Manakonline portals.
4. Normalizes categories in discovered_scheme_1_products.json.
"""
import sys
import re
import json
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT_DIR / "data"
KNOWLEDGE_STORE_FILE = DATA_DIR / "knowledge_store.json"
SCHEME_1_FILE = DATA_DIR / "sources" / "discovered_scheme_1_products.json"


def clean_knowledge_store():
    if not KNOWLEDGE_STORE_FILE.exists():
        print(f"File not found: {KNOWLEDGE_STORE_FILE}")
        return

    with open(KNOWLEDGE_STORE_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    chunks = data.get("chunks", [])
    print(f"Total chunks in knowledge_store: {len(chunks)}")
    repaired_count = 0

    for idx, c in enumerate(chunks):
        doc_title = c.get("document_title", "")
        text = c.get("chunk_text", "")
        sec = c.get("section", "")

        # Target chunks with corrupt preamble or mislabeled Cement sections
        if doc_title == "Scheme I Compulsory Standards Registry" or "Compulsory ISI Mark: Cement" in sec or "Compulsory ISI Mark: Cement" in text:
            # 1. Clean the text preamble
            cleaned_text = re.sub(
                r"Official BIS Compulsory Product Certification \(Scheme I [^\)]*\): Compulsory ISI Mark: Cement \(any variety of cement manufactured or sold in India\) such as\s*",
                "Official BIS Compulsory Product Certification (Scheme I — ISI Mark) — Notified Standards & Quality Control Orders (QCO):\n",
                text
            )

            # 2. Extract standards and product titles in this chunk
            stds = re.findall(r"Standard:\s*IS\s*([^\s—–-]+)[\s—–-]+([^.\n]+)", text)
            qcos = re.findall(r"Mandated under Quality Control Order:\s*([^.\n]+)", text)

            section_parts = []
            if stds:
                for s_num, s_title in stds[:2]:
                    s_num_clean = s_num.strip()
                    s_title_clean = s_title.strip()
                    if len(s_title_clean) > 35:
                        s_title_clean = s_title_clean[:32] + "..."
                    section_parts.append(f"IS {s_num_clean} ({s_title_clean})")
            elif qcos:
                q_clean = re.sub(r"^\d+\.\s*", "", qcos[0]).strip()
                q_clean = re.sub(r"\(Quality Control\).*", "QCO", q_clean, flags=re.I).strip()
                section_parts.append(q_clean[:50])

            new_section = " / ".join(section_parts) if section_parts else "Compulsory ISI Mark Standards"

            c["chunk_text"] = cleaned_text
            c["section"] = new_section
            
            # 3. Clean source URL
            if not c.get("source_url") or c.get("source_url") == "https://www.bis.gov.in":
                c["source_url"] = "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-i-mark-scheme/?lang=en"

            repaired_count += 1

    print(f"Repaired {repaired_count} chunks in knowledge store.")

    # Save repaired knowledge store
    with open(KNOWLEDGE_STORE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Saved repaired knowledge_store.json.")


def clean_discovered_products():
    if not SCHEME_1_FILE.exists():
        print(f"File not found: {SCHEME_1_FILE}")
        return

    with open(SCHEME_1_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    print(f"Total products in discovered_scheme_1_products: {len(products)}")
    fixed_count = 0

    for p in products:
        qco_order = p.get("qco_order", "") or ""
        title = p.get("title", "") or ""
        cat = p.get("category", "") or ""

        if "Cement (any variety of cement manufactured or sold in India)" in cat:
            # Determine clean category based on QCO or product title
            clean_cat = "Compulsory ISI Mark: General Engineering & Consumer Goods"
            if qco_order:
                q_clean = re.sub(r"^\d+\.\s*", "", qco_order).strip()
                q_clean = re.sub(r"\(S\.O\..*", "", q_clean).strip()
                if len(q_clean) > 3:
                    clean_cat = f"Compulsory ISI Mark: {q_clean[:60]}"
            elif title:
                clean_cat = f"Compulsory ISI Mark: {title[:50]}"

            p["category"] = clean_cat
            fixed_count += 1

    print(f"Fixed {fixed_count} product categories in discovered_scheme_1_products.json.")

    with open(SCHEME_1_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print("Saved repaired discovered_scheme_1_products.json.")


if __name__ == "__main__":
    clean_knowledge_store()
    clean_discovered_products()
