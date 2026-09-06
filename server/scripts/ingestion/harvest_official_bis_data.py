import sys
import os
import re
import ssl
import json
import time
import hashlib
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from html.parser import HTMLParser

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.core.logging import logger

DATA_SOURCES_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "sources"
DATA_SOURCES_DIR.mkdir(parents=True, exist_ok=True)

REPORTS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.current_row = []
        self.current_cell = []
        self.current_link = None
        self.in_cell = False
        self.cell_tag = None

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self.current_row = []
        elif tag in ("td", "th"):
            self.in_cell = True
            self.cell_tag = tag
            self.current_cell = []
            self.current_link = None
        elif tag == "a" and self.in_cell:
            for attr_name, attr_val in attrs:
                if attr_name.lower() == "href" and attr_val:
                    self.current_link = attr_val.strip()

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.in_cell:
            cell_text = " ".join("".join(self.current_cell).split())
            self.current_row.append({
                "tag": self.cell_tag,
                "text": cell_text,
                "link": self.current_link
            })
            self.in_cell = False
            self.cell_tag = None
            self.current_link = None
        elif tag == "tr":
            if self.current_row:
                self.rows.append(self.current_row)
                self.current_row = []

    def handle_data(self, data):
        if self.in_cell:
            self.current_cell.append(data)


def fetch_url_with_retry(url: str, retries: int = 3, timeout: int = 45) -> Optional[str]:
    """Fetch URL with exponential backoff and timeout."""
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=CTX, timeout=timeout) as resp:
                if resp.status == 200:
                    return resp.read().decode("utf-8", errors="ignore")
                logger.warning(f"HTTP {resp.status} for {url}")
        except Exception as exc:
            logger.warning(f"[Attempt {attempt}/{retries}] Error fetching {url}: {exc}")
            if attempt < retries:
                time.sleep(2 ** attempt)
    return None


def compute_hash(text: str) -> str:
    """Deterministic SHA-256 content hash."""
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()


def harvest_scheme_1_compulsory_products() -> List[Dict[str, Any]]:
    """
    Harvest official Scheme-I Compulsory Certification (ISI Mark) products from bis.gov.in.
    Dynamically parses categories (th) and product rows (td) with QCO notification links.
    """
    url = "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-i-mark-scheme/?lang=en"
    logger.info(f"Harvesting Scheme I products from {url}...")
    html = fetch_url_with_retry(url, retries=3, timeout=60)
    if not html:
        logger.error("Failed to fetch Scheme I page.")
        return []

    parser = TableParser()
    parser.feed(html)
    logger.info(f"Parsed {len(parser.rows)} rows in Scheme I page.")

    products = []
    seen_codes = set()
    retrieved_at = datetime.now(timezone.utc).isoformat()
    current_category = "General Products under Compulsory Certification"
    current_qco = None

    for row in parser.rows:
        # Check if row is a category header
        if len(row) == 1 and row[0]["tag"] == "th":
            header_text = row[0]["text"]
            if header_text and len(header_text) > 3:
                current_category = header_text
                current_qco = None
            continue

        # Check if row is a product data row
        td_cells = [c for c in row if c["tag"] == "td"]
        if len(td_cells) >= 3:
            s_no = td_cells[0]["text"]
            is_no_raw = td_cells[1]["text"]
            prod_title = td_cells[2]["text"]

            # Notification link might be in 4th cell or carried forward from previous rowspan
            notif_link = None
            if len(td_cells) >= 4:
                notif_cell = td_cells[3]
                notif_link = notif_cell["link"]
                if notif_cell["text"]:
                    current_qco = notif_cell["text"]

            # Normalize IS number
            is_no = re.sub(r"\s*:\s*", ":", is_no_raw).strip()
            if is_no and not is_no.upper().startswith("IS"):
                is_no = f"IS {is_no}"

            clean_title = re.sub(r"\s+", " ", prod_title).strip()

            if is_no and clean_title and is_no not in seen_codes:
                seen_codes.add(is_no)
                record = {
                    "code": is_no,
                    "title": clean_title,
                    "category": f"Compulsory ISI Mark: {current_category}",
                    "scheme": "Scheme I (ISI Mark)",
                    "status": "Compulsory",
                    "qco_order": current_qco,
                    "qco_notification_url": notif_link,
                    "source_url": url,
                    "authority": "Bureau of Indian Standards (BIS)",
                    "jurisdiction": "India",
                    "retrieved_at": retrieved_at,
                    "content_hash": compute_hash(f"{is_no}|{clean_title}|Scheme I"),
                    "is_demo": False
                }
                products.append(record)

    logger.info(f"Successfully harvested {len(products)} distinct Scheme I products.")
    return products


def harvest_scheme_2_crs_products() -> List[Dict[str, Any]]:
    """
    Harvest official Scheme-II Compulsory Registration Scheme (CRS) products from bis.gov.in.
    Notified by MeitY / MNRE for electronics, IT, and solar photovoltaic goods.
    """
    url = "https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-ii-registration-scheme/?lang=en"
    logger.info(f"Harvesting Scheme II (CRS) products from {url}...")
    html = fetch_url_with_retry(url, retries=3, timeout=45)
    if not html:
        logger.error("Failed to fetch Scheme II page.")
        return []

    parser = TableParser()
    parser.feed(html)
    logger.info(f"Parsed {len(parser.rows)} rows in Scheme II page.")

    products = []
    seen_codes = set()
    retrieved_at = datetime.now(timezone.utc).isoformat()

    for row in parser.rows:
        td_cells = [c for c in row if c["tag"] == "td"]
        if len(td_cells) >= 3:
            s_no = td_cells[0]["text"]
            is_no_raw = td_cells[1]["text"]
            std_title = td_cells[2]["text"]
            prod_cat = td_cells[3]["text"] if len(td_cells) >= 4 else ""
            notif_link = td_cells[4]["link"] if len(td_cells) >= 5 else None

            is_no = re.sub(r"\s*:\s*", ":", is_no_raw).strip()
            if is_no and not is_no.upper().startswith("IS"):
                is_no = f"IS {is_no}"

            full_title = f"{prod_cat} — {std_title}".strip(" —") if prod_cat else std_title

            if is_no and full_title and is_no not in seen_codes:
                seen_codes.add(is_no)
                record = {
                    "code": is_no,
                    "title": full_title,
                    "category": f"Compulsory Registration Scheme (CRS): {prod_cat or 'Electronics and IT'}",
                    "scheme": "Scheme II (CRS)",
                    "status": "Compulsory",
                    "qco_notification_url": notif_link,
                    "source_url": url,
                    "authority": "Bureau of Indian Standards (BIS) / MeitY",
                    "jurisdiction": "India",
                    "retrieved_at": retrieved_at,
                    "content_hash": compute_hash(f"{is_no}|{full_title}|Scheme II"),
                    "is_demo": False
                }
                products.append(record)

    logger.info(f"Successfully harvested {len(products)} distinct Scheme II (CRS) products.")
    return products


def harvest_lims_laboratories() -> List[Dict[str, Any]]:
    """
    Harvest recognized testing laboratories from official BIS LIMS portal (lims.bis.gov.in).
    Iterates dynamically through all pagination pages until the end.
    """
    base_url = "https://lims.bis.gov.in/home/labs/"
    logger.info(f"Harvesting recognized laboratories from BIS LIMS: {base_url}...")
    
    html_p1 = fetch_url_with_retry(f"{base_url}?page=1", retries=3, timeout=30)
    if not html_p1:
        logger.error("Failed to fetch LIMS page 1.")
        return []

    # Discover last page number dynamically
    last_page_match = re.search(r'href=["\']\?page=(\d+)["\']>Last</a>', html_p1, re.I)
    max_pages = int(last_page_match.group(1)) if last_page_match else 22
    logger.info(f"Discovered {max_pages} pagination pages in BIS LIMS directory.")

    laboratories = []
    seen_codes = set()
    retrieved_at = datetime.now(timezone.utc).isoformat()

    for page in range(1, max_pages + 1):
        page_url = f"{base_url}?page={page}"
        html = fetch_url_with_retry(page_url, retries=2, timeout=25) if page > 1 else html_p1
        if not html:
            logger.warning(f"Could not load LIMS page {page}, skipping.")
            continue

        parser = TableParser()
        parser.feed(html)

        for row in parser.rows:
            td_cells = [c for c in row if c["tag"] == "td"]
            if len(td_cells) >= 8:
                s_no = td_cells[0]["text"]
                lab_code = td_cells[1]["text"]
                lab_name = td_cells[2]["text"]
                address = td_cells[3]["text"]
                contact_person = td_cells[4]["text"]
                contact_number = td_cells[5]["text"]
                email = td_cells[6]["text"]
                validity_date = td_cells[7]["text"]
                scope_link = td_cells[8]["link"] if len(td_cells) >= 9 else None

                if scope_link and scope_link.startswith("/"):
                    scope_link = f"https://lims.bis.gov.in{scope_link}"

                addr_clean = re.sub(r"\s+", " ", address).strip()
                addr_parts = [p.strip() for p in addr_clean.split(",") if p.strip()]
                state = addr_parts[-2] if len(addr_parts) >= 3 else ""
                city = addr_parts[-3] if len(addr_parts) >= 4 else (addr_parts[0] if addr_parts else "")

                scope_summary = (
                    f"Validity: {validity_date} (Lab Code: {lab_code}). Recognized BIS Testing Laboratory under BIS LIMS. "
                    f"Contact: {contact_person} ({email}, {contact_number}). Address: {addr_clean}."
                )
                if scope_link:
                    scope_summary += f" Official LIMS Scope details: {scope_link}"

                if lab_name and lab_code not in seen_codes and lab_code.isdigit():
                    seen_codes.add(lab_code)
                    lab_record = {
                        "name": lab_name,
                        "lab_code": lab_code,
                        "location": f"{city} {state}".strip() or "India",
                        "state": state or None,
                        "address": addr_clean,
                        "contact_person": contact_person or None,
                        "contact_number": contact_number or None,
                        "email": email or None,
                        "validity_date": validity_date or None,
                        "categories": ["Recognized BIS Testing Laboratory", "BIS LIMS"],
                        "scope_of_testing": scope_summary,
                        "scope_url": scope_link,
                        "recognition_status": "Recognized",
                        "source_url": page_url,
                        "authority": "Bureau of Indian Standards (BIS LIMS)",
                        "jurisdiction": "India",
                        "retrieved_at": retrieved_at,
                        "content_hash": compute_hash(f"{lab_code}|{lab_name}|{validity_date}"),
                        "is_demo": False
                    }
                    laboratories.append(lab_record)

        logger.info(f"Harvested page {page}/{max_pages} -> Accumulated {len(laboratories)} laboratories.")
        time.sleep(0.4)

    logger.info(f"Successfully harvested {len(laboratories)} distinct BIS recognized laboratories.")
    return laboratories


def run_harvest():
    """Main execution of the official BIS crawler and harvester."""
    logger.info("=== STARTING OFFICIAL BIS KNOWLEDGE HARVESTING ===")
    start_time = time.time()

    # 1. Scheme I Compulsory ISI Products
    scheme_1_products = harvest_scheme_1_compulsory_products()
    out_s1 = DATA_SOURCES_DIR / "discovered_scheme_1_products.json"
    out_s1.write_text(json.dumps(scheme_1_products, indent=2, ensure_ascii=False), encoding="utf-8")

    # 2. Scheme II CRS Products
    scheme_2_products = harvest_scheme_2_crs_products()
    out_s2 = DATA_SOURCES_DIR / "discovered_scheme_2_products.json"
    out_s2.write_text(json.dumps(scheme_2_products, indent=2, ensure_ascii=False), encoding="utf-8")

    # 3. BIS LIMS Recognized Laboratories
    lims_labs = harvest_lims_laboratories()
    out_labs = DATA_SOURCES_DIR / "discovered_lims_laboratories.json"
    out_labs.write_text(json.dumps(lims_labs, indent=2, ensure_ascii=False), encoding="utf-8")

    elapsed = round(time.time() - start_time, 2)
    logger.info("=== HARVEST COMPLETE ===")
    logger.info(f"Elapsed Time: {elapsed}s")
    logger.info(f"Scheme I products discovered (Dynamic): {len(scheme_1_products)}")
    logger.info(f"Scheme II products discovered (Dynamic): {len(scheme_2_products)}")
    logger.info(f"BIS LIMS laboratories discovered (Dynamic): {len(lims_labs)}")
    logger.info(f"Total structured records: {len(scheme_1_products) + len(scheme_2_products) + len(lims_labs)}")


if __name__ == "__main__":
    run_harvest()
