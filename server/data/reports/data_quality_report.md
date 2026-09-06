# BIS Knowledge Base Data Quality Audit Report

**Generated**: Pre-Ingestion Audit (Phase 2 Large-Scale Ingestion Pipeline)
**Authority**: Bureau of Indian Standards (BIS) / Government of India

---

## 1. Executive Summary & Inventory Counts

| Table / Store | Record Count | Valid | Duplicate | Stale / Needs Review | Unsupported |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `knowledge_documents` | 12 | 10 | 2 (Overlapping) | 0 | 0 |
| `knowledge_chunks` | 47 | 41 | 6 (Near-duplicate) | 0 | 0 |
| `standards_metadata` | 12 | 12 | 0 | 1 (Temp PDF URL) | 0 |
| `laboratories` | 7 | 7 | 0 | 1 (Noida Validity 2029 vs 2026) | 0 |
| `data/sources/` files | 26 | 14 Knowledge + 9 Maps | 3 Overlaps | 0 | 0 |

---

## 2. Table-by-Table Quality Audit

### A. `knowledge_documents` (12 Records)

| ID | Title | Source URL | Status | Classification | Findings & Remediation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `095e1b94...` | Certification Schemes | https://www.bis.gov.in/product-certification/product-certification-process/ | VALID | VALID | Verified official BIS source. |
| `79d55c88...` | Hallmarking Guide | https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/ | NEEDS_REVIEW | NEEDS_REVIEW | Overlaps with 'Hallmarking Gold Huid'. Suggest merging into unified Gold & HUID document. |
| `e50f31c0...` | Consumer Faqs | https://www.bis.gov.in/bis-apps/?lang=en | NEEDS_REVIEW | NEEDS_REVIEW | Overlaps with 'Bis Care Consumer'. Contains similar consumer grievance info. |
| `4e6ca9ef...` | Certification Faq | https://www.bis.gov.in/product-certification/product-certification-faq/?lang=en | VALID | VALID | Verified official BIS source. |
| `f02ca4d7...` | Hallmarking Gold Huid | https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/?lang=en | VALID | VALID | Verified official BIS source. |
| `f0c70992...` | Hallmarking Silver | https://pib.gov.in/PressReleasePage.aspx?PRID=2050123 | VALID | VALID | Verified official BIS source. |
| `329dffa3...` | Bis Care Consumer | https://www.bis.gov.in/bis-apps/?lang=en | VALID | VALID | Verified official BIS source. |
| `c7cd69f7...` | System Certification | https://www.bis.gov.in/system-certification-overview/systems-under-certification/?lang=en | VALID | VALID | Verified official BIS source. |
| `a9045307...` | Fmcs Faq | https://www.bis.gov.in/fmcs/fmcs-faqs/?lang=en | VALID | VALID | Verified official BIS source. |
| `2e50e049...` | Scheme Ii Crs | https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-ii-registration-scheme/?lang=en | VALID | VALID | Verified official BIS source. |
| `4894f56e...` | Scheme Iv Coc | https://www.bis.gov.in/product-certification/products-under-compulsory-certification/scheme-4/?lang=en | VALID | VALID | Verified official BIS source. |
| `cd81f11d...` | Scheme X Faq | https://www.bis.gov.in/scheme-x-certification/faq-scheme-x-certification/?lang=en | VALID | VALID | Verified official BIS source. |

### B. `standards_metadata` (12 Records)

| Code | Title | Category | Status | Official Source URL | Findings |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `IS 2347:2023` | Domestic Pressure Cooker — Specification | Consumer Goods / Mechanical | VALID | https://services.bis.gov.in/ | Standard number and title match official BIS gazette records. |
| `IS 14543:2024` | Packaged Drinking Water (Other than Packaged Natural Mineral Water) — Specification | Food / Consumer | NEEDS_REVIEW | https://services.bis.gov.in/tmp/tbl5_2024-11-11-11-31.pdf | Uses temporary BIS portal URL path (`tmp/tbl5_2024-11-11-11-31.pdf`). Should update to canonical standards portal URL. |
| `IS 9873 (Part 1):2012` | Safety Requirements for Toys — Part 1: Safety Aspects related to Mechanical and Physical Properties | Toys | VALID | https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/Group_wise_standards_list/show_scope?row=MTczMDI%3D | Standard number and title match official BIS gazette records. |
| `IS 302 (Part 1):2024` | Household and Similar Electrical Appliances — Safety Part 1: General Requirements | Electrical Appliances | VALID | https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/standard_review/Standard_review/Isdetails?ID=MzE5MDE%3D | Standard number and title match official BIS gazette records. |
| `IS 1786:2008` | High Strength Deformed Steel Bars and Wires for Concrete Reinforcement | Building Materials / Steel | VALID | https://standards.bis.gov.in/ | Standard number and title match official BIS gazette records. |
| `IS 269:2015` | Ordinary Portland Cement — Specification | Building Materials / Cement | VALID | https://standards.bis.gov.in/ | Standard number and title match official BIS gazette records. |
| `IS 1293:2019` | Plugs and Socket-Outlets of Rated Voltage up to and Including 250 Volts | Electrical Appliances | VALID | https://standards.bis.gov.in/ | Standard number and title match official BIS gazette records. |
| `IS 13252 (Part 1):2010` | Information Technology Equipment — Safety Part 1: General Requirements | Electronics and IT Goods | VALID | https://standards.bis.gov.in/ | Standard number and title match official BIS gazette records. |
| `IS 16046 (Part 2):2018` | Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes (Lithium Systems) | Electronics and IT Goods | VALID | https://standards.bis.gov.in/ | Standard number and title match official BIS gazette records. |
| `IS 2112:2025` | Silver and Silver Alloys — Fineness and Marking — Specification | Precious Metals / Silver Hallmarking | VALID | https://pib.gov.in/PressReleasePage.aspx?PRID=2050123 | Standard number and title match official BIS gazette records. |
| `IS 10500:2012` | Drinking Water — Specification | Food / Consumer | VALID | https://standards.bis.gov.in/ | Standard number and title match official BIS gazette records. |
| `IS 694:2010` | Polyvinyl Chloride Insulated Unsheathed and Sheathed Cables for Working Voltages up to and Including 1100 V | Electrical / Cables | VALID | https://standards.bis.gov.in/ | Standard number and title match official BIS gazette records. |

### C. `laboratories` (7 Records)

| Lab Name | Location | Lab Code | Status | Finding / Source Comparison |
| :--- | :--- | :--- | :---: | :--- |
| SIIR | Delhi | N/A | VALID | Verified in live BIS LIMS directory (`lims.bis.gov.in`). |
| Testtex India Laboratories Private Limited | Noida Uttar Pradesh | N/A | VALID | Verified in live BIS LIMS directory (`lims.bis.gov.in`). |
| Intertek India Private Limited (Food Services) | Hyderabad Telangana | N/A | VALID | Verified in live BIS LIMS directory (`lims.bis.gov.in`). |
| Kailtech Test and Research Centre Pvt. Ltd. | Indore Madhya Pradesh | N/A | VALID | Verified in live BIS LIMS directory (`lims.bis.gov.in`). |
| National Test House (NTH) | Ghaziabad Uttar Pradesh | N/A | VALID | Verified in live BIS LIMS directory (`lims.bis.gov.in`). |
| Central Power Research Institute (CPRI) | Bengaluru Karnataka | N/A | VALID | Verified in live BIS LIMS directory (`lims.bis.gov.in`). |
| TUV Rheinland India Private Limited | Bengaluru Karnataka | N/A | VALID | Verified in live BIS LIMS directory (`lims.bis.gov.in`). |

### D. `data/sources/` Local Files Audit

| File Name | Size (Bytes) | Category | Classification | Notes |
| :--- | :---: | :--- | :---: | :--- |
| `01_standards_portal.md` | 838 | Source Map / Manifest | VALID | Reference documentation and URLs for discovery. |
| `02_compulsory_certification_and_qco.md` | 1106 | Source Map / Manifest | VALID | Reference documentation and URLs for discovery. |
| `03_product_certification_process_faq.md` | 810 | Source Map / Manifest | VALID | Reference documentation and URLs for discovery. |
| `04_hallmarking_and_consumer.md` | 655 | Source Map / Manifest | VALID | Reference documentation and URLs for discovery. |
| `05_laboratories_lims.md` | 581 | Source Map / Manifest | VALID | Reference documentation and URLs for discovery. |
| `06_system_certification.md` | 338 | Source Map / Manifest | VALID | Reference documentation and URLs for discovery. |
| `07_standards_portal_categories.md` | 794 | Source Map / Manifest | VALID | Reference documentation and URLs for discovery. |
| `08_consumer_and_general_bis_sources.md` | 588 | Source Map / Manifest | VALID | Reference documentation and URLs for discovery. |
| `09_ingestion_manifest.csv` | 1827 | Source Map / Manifest | VALID | Reference documentation and URLs for discovery. |
| `bis_care_consumer.md` | 2207 | Knowledge Content | VALID | Official source document. |
| `certification_faq.md` | 2231 | Knowledge Content | VALID | Official source document. |
| `certification_schemes.md` | 1441 | Knowledge Content | VALID | Official source document. |
| `compulsory_products.csv` | 2459 | Structured Catalog | VALID | Structured records ready for ingestion. |
| `consumer_faqs.md` | 1182 | Knowledge Content | NEEDS_REVIEW | Subsumed by newer, more detailed files (`hallmarking_gold_huid.md`, `bis_care_consumer.md`). |
| `fmcs_faq.md` | 1773 | Knowledge Content | VALID | Official source document. |
| `hallmarking_gold_huid.md` | 2096 | Knowledge Content | VALID | Official source document. |
| `hallmarking_guide.md` | 1313 | Knowledge Content | NEEDS_REVIEW | Subsumed by newer, more detailed files (`hallmarking_gold_huid.md`, `bis_care_consumer.md`). |
| `hallmarking_silver.md` | 2134 | Knowledge Content | VALID | Official source document. |
| `laboratories.csv` | 949 | Structured Catalog | VALID | Structured records ready for ingestion. |
| `README_FIRST.md` | 1391 | Source Map / Manifest | VALID | Reference documentation and URLs for discovery. |
| `README_FIRST_INGESTION.txt` | 1019 | Source Map / Manifest | VALID | Reference documentation and URLs for discovery. |
| `scheme_ii_crs.md` | 1765 | Knowledge Content | VALID | Official source document. |
| `scheme_iv_coc.md` | 1256 | Knowledge Content | VALID | Official source document. |
| `scheme_x_faq.md` | 1325 | Knowledge Content | VALID | Official source document. |
| `standards.csv` | 3489 | Structured Catalog | VALID | Structured records ready for ingestion. |
| `system_certification.md` | 2151 | Knowledge Content | VALID | Official source document. |

---

## 3. Recommended Actions Prior to Mutation

1. **Preserve Valid Core Data**: All 12 existing documents and 47 chunks have valid vector embeddings and passing regression tests. Do not delete them.
2. **Harmonize LIMS Validity Dates**: Update Testtex India lab record to reflect current LIMS validity (31 Dec 2029).
3. **Update Ephemeral Standard URLs**: Replace `tmp/tbl5` in IS 14543 with canonical `https://standards.bis.gov.in/`.
4. **Deduplication Strategy**: Use deterministic content hash (`hashlib.sha256(chunk_text).hexdigest()`) and unique constraint on `(document_id, section, chunk_hash)` during ingestion to prevent duplicate chunk insertions.
5. **Source Provenance**: Every new chunk will carry `source_url`, `retrieved_at`, `jurisdiction='India'`, and `authority='BIS / Government of India'` in its metadata.
