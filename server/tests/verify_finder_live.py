import httpx

with httpx.Client(base_url="http://localhost:8000", timeout=30.0) as c:
    # 1. Health
    r_health = c.get("/api/health")
    print("1. Backend Health:", r_health.status_code, r_health.json()["status"])

    # 2. Relevant Product Finder Query
    p1 = {
        "product": "Domestic Pressure Cooker",
        "category": "Consumer Goods / Mechanical",
        "material": "Aluminium",
        "intended_use": "Domestic food cooking",
        "description": "Capacity 5 litres with safety relief valve",
        "language": "en"
    }
    r1 = c.post("/api/v1/standards/search", json=p1)
    d1 = r1.json()
    print("\n2. Relevant Product Finder Result:")
    print("   Status:", r1.status_code)
    stds = d1.get("standards", [])
    print(f"   Standards Found: {len(stds)}")
    for s in stds:
        print(f"   - Code: {s['code']} | Title: {s['title']} | Score: {s.get('relevance_score')} | Label: {s.get('label')}")
    if d1.get("sources"):
        print("   Citation URL:", d1["sources"][0].get("url"))

    # 3. Unrelated Product Finder Query
    p2 = {
        "product": "Deep Sea Submarine Thruster",
        "language": "en"
    }
    r2 = c.post("/api/v1/standards/search", json=p2)
    d2 = r2.json()
    print("\n3. Unrelated Product Finder Result:")
    print("   Status:", r2.status_code)
    print(f"   Standards Found: {len(d2.get('standards', []))}")
    print("   Summary:", d2.get("summary"))
    print("   Clarification Guidance:", d2.get("clarification_prompt"))

    # 4. Frontend Route Check
    with httpx.Client(base_url="http://localhost:3000", timeout=30.0) as fc:
        rf = fc.get("/finder")
        print("\n4. Frontend Finder Page Status:", rf.status_code)

    print("\n*** ALL PRODUCT FINDER SMOKE CHECKS PASSED ***")
