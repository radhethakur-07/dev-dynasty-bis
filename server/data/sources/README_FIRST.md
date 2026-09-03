# Dev Dynasty — BIS Maximum Data Expansion Source Pack

This pack is a verified SOURCE MAP, not a fabricated BIS dataset.

Goal:
Use these official BIS sources to expand `server/data/sources/` and then run the existing ingestion pipeline.

Why this pack is not filled with guessed standards:
The BIS corpus is large and changes over time. Technical requirements, fineness grades, QCO dates, lab scopes, and certification rules must come from the current official source. Do not invent or bulk-fill values from memory.

Recommended ingestion order:
P0 → P1 → P2. For every chunk, keep source title, URL, retrieval date, and document type.

Suggested first target:
1. All searchable published-standard metadata that BIS exposes publicly.
2. Compulsory certification + QCO mappings.
3. Product certification process/FAQ.
4. Hallmarking + HUID, including Silver only after official verification.
5. Current recognized laboratory metadata and scope where explicitly available.

The web-research snapshot used to build this pack verified that:
- BIS Know Your Standard is intended as a one-stop access point for standard documents/data.
- BIS's compulsory-certification page lists Scheme I, II, IV and X resources.
- BIS LIMS currently exposes a searchable list of recognized labs and states a scope disclaimer.

Source URLs:
See the numbered markdown files and `09_ingestion_manifest.csv`.
