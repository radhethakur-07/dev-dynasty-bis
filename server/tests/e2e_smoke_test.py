import httpx
import json

base_url = "http://localhost:8000"

def run_tests():
    with httpx.Client(base_url=base_url, timeout=15.0) as client:
        print("=== 1. HEALTH CHECK ===")
        r = client.get("/api/health")
        print(f"Status: {r.status_code} | Body: {r.json()}")
        assert r.status_code == 200

        print("\n=== 2. BIS STANDARD QUERY ===")
        r1 = client.post("/api/v1/chat", json={"message": "What Indian Standard applies to domestic pressure cooker?", "language": "en"})
        d1 = r1.json()
        print(f"Status: {r1.status_code} | Intent: {d1.get('intent')} | Tool: {d1.get('tool_called')}")
        resp1 = d1.get("response", {})
        print(f"Response Type: {resp1.get('type')} | Standard Code: {resp1.get('standards', [{}])[0].get('code')} | Title: {resp1.get('standards', [{}])[0].get('title')}")
        print(f"Citations count: {len(resp1.get('sources', []))} | URL: {resp1.get('sources', [{}])[0].get('url')}")
        assert resp1.get("type") == "standard_recommendation"

        print("\n=== 3. CERTIFICATION QUERY ===")
        r2 = client.post("/api/v1/chat", json={"message": "How to get ISI mark certification license for factory?", "language": "en"})
        d2 = r2.json()
        print(f"Status: {r2.status_code} | Intent: {d2.get('intent')} | Tool: {d2.get('tool_called')}")
        resp2 = d2.get("response", {})
        print(f"Response Type: {resp2.get('type')} | Steps count: {len(resp2.get('steps', []))} | Scheme: {resp2.get('scheme_name')}")
        assert resp2.get("type") == "certification_guidance"

        print("\n=== 4. HALLMARKING & HUID QUERY ===")
        r3 = client.post("/api/v1/chat", json={"message": "What are the 3 mandatory marks for gold hallmarking and HUID?", "language": "en"})
        d3 = r3.json()
        print(f"Status: {r3.status_code} | Intent: {d3.get('intent')} | Tool: {d3.get('tool_called')}")
        resp3 = d3.get("response", {})
        print(f"Response Type: {resp3.get('type')} | Mandatory marks count: {len(resp3.get('mandatory_marks', []))} | Verification steps: {len(resp3.get('consumer_verification_steps', []))}")
        print(f"Citation URL: {resp3.get('sources', [{}])[0].get('url')}")
        assert resp3.get("type") == "hallmarking_info"

        print("\n=== 5. HINDI QUERY ===")
        r4 = client.post("/api/v1/chat", json={"message": "सोने के आभूषण पर हॉलमार्क और HUID कैसे चेक करें?", "language": "hi"})
        d4 = r4.json()
        print(f"Status: {r4.status_code} | Intent: {d4.get('intent')} | Tool: {d4.get('tool_called')}")
        resp4 = d4.get("response", {})
        print(f"Response Type: {resp4.get('type')} | Summary: {resp4.get('type')}...")
        assert resp4.get("type") == "hallmarking_info"

        print("\n=== 6. OUT-OF-SCOPE QUERY ===")
        r5 = client.post("/api/v1/chat", json={"message": "Write a python script to play minecraft game", "language": "en"})
        d5 = r5.json()
        print(f"Status: {r5.status_code} | Intent: {d5.get('intent')}")
        resp5 = d5.get("response", {})
        print(f"Response Type: {resp5.get('type')} | Content: {resp5.get('content')[:80]}...")
        assert d5.get("intent") == "unsupported_or_out_of_scope"

        print("\n=== 7. DEDICATED ENDPOINTS ===")
        # Labs search
        rlab = client.post("/api/v1/laboratories/search", json={"product_or_test": "food", "location": "Hyderabad"})
        dlab = rlab.json()
        print(f"Labs Search: count={len(dlab.get('laboratories', []))} | Lab={dlab.get('laboratories', [{}])[0].get('name')} | URL={dlab.get('laboratories', [{}])[0].get('source_url')}")
        assert len(dlab.get("laboratories", [])) > 0

        print("\n*** ALL E2E SMOKE TESTS PASSED CLEANLY ***")

if __name__ == "__main__":
    run_tests()
