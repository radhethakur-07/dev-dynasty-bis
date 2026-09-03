import httpx
import json

BASE_URL = "http://localhost:8000"
CLIENT_URL = "http://localhost:3000"

def run_qa_pass():
    print("=" * 70)
    print("DEV DYNASTY -- BIS INTELLIGENCE ASSISTANT QA PASS")
    print("=" * 70)

    results = []

    with httpx.Client(base_url=BASE_URL, timeout=30.0) as client:
        # -------------------------------------------------------------
        # Scenario 1: Domestic Pressure Cooker
        # -------------------------------------------------------------
        print("\n[SCENARIO 1] Domestic Pressure Cooker")
        p1 = {
            "product": "Domestic Pressure Cooker",
            "category": "Consumer Goods / Mechanical",
            "material": "Aluminium",
            "intended_use": "Domestic food cooking",
            "description": "Kitchen pressure cooker capacity 5 litres with safety valve",
            "language": "en"
        }
        r1 = client.post("/api/v1/standards/search", json=p1)
        d1 = r1.json()
        stds1 = d1.get("standards", [])
        c_codes1 = [s["code"] for s in stds1]
        
        has_2347 = any("2347" in c for c in c_codes1)
        no_toys = not any("9873" in c for c in c_codes1)
        no_water = not any("14543" in c for c in c_codes1)
        match_strength = stds1[0].get("match_strength") if stds1 else None
        relevance_score = stds1[0].get("relevance_score") if stds1 else None
        citation_url = d1.get("sources", [{}])[0].get("url") if d1.get("sources") else None

        print(f" - Standards Found: {len(stds1)}")
        print(f" - Top Standard: {c_codes1[0] if c_codes1 else 'None'}")
        print(f" - Match Strength: {match_strength} (Score: {relevance_score})")
        print(f" - Label: {stds1[0].get('label') if stds1 else 'None'}")
        print(f" - Cross-Category Clean: {no_toys and no_water}")
        print(f" - Citation URL: {citation_url}")

        s1_pass = has_2347 and no_toys and no_water and citation_url and "services.bis.gov.in" in citation_url
        results.append(("Scenario 1: Domestic Pressure Cooker", s1_pass))

        r1_chat = client.post("/api/v1/chat", json={"message": "What Indian Standard applies to domestic pressure cookers?", "language": "en"})
        d1_chat = r1_chat.json()
        print(f" - Chat Intent: {d1_chat.get('intent')} | Tool Called: {d1_chat.get('tool_called')}")

        # -------------------------------------------------------------
        # Scenario 2: Packaged Drinking Water
        # -------------------------------------------------------------
        print("\n[SCENARIO 2] Packaged Drinking Water")
        p2 = {
            "product": "Packaged Drinking Water",
            "category": "Food / Consumer",
            "material": "PET Bottle",
            "intended_use": "Direct human consumption",
            "description": "Treated drinking water packaged in food grade plastic",
            "language": "en"
        }
        r2 = client.post("/api/v1/standards/search", json=p2)
        d2 = r2.json()
        stds2 = d2.get("standards", [])
        c_codes2 = [s["code"] for s in stds2]
        
        has_14543 = any("14543" in c for c in c_codes2)
        no_cookers2 = not any("2347" in c for c in c_codes2)
        no_toys2 = not any("9873" in c for c in c_codes2)
        
        print(f" - Standards Found: {len(stds2)}")
        print(f" - Top Standard: {c_codes2[0] if c_codes2 else 'None'}")
        print(f" - Match Strength: {stds2[0].get('match_strength') if stds2 else 'None'} (Score: {stds2[0].get('relevance_score') if stds2 else 'None'})")
        print(f" - Cross-Category Clean: {no_cookers2 and no_toys2}")
        print(f" - Citation URL: {d2.get('sources', [{}])[0].get('url') if d2.get('sources') else 'None'}")

        s2_pass = has_14543 and no_cookers2 and no_toys2
        results.append(("Scenario 2: Packaged Drinking Water", s2_pass))

        # -------------------------------------------------------------
        # Scenario 3: Toys
        # -------------------------------------------------------------
        print("\n[SCENARIO 3] Toys for Children")
        p3 = {
            "product": "Plastic Toys for Children",
            "category": "Toys",
            "material": "Non-toxic Polymer",
            "intended_use": "Children under 14 years play",
            "description": "Mechanical and physical safety of play articles",
            "language": "en"
        }
        r3 = client.post("/api/v1/standards/search", json=p3)
        d3 = r3.json()
        stds3 = d3.get("standards", [])
        c_codes3 = [s["code"] for s in stds3]

        has_9873 = any("9873" in c for c in c_codes3)
        no_cookers3 = not any("2347" in c for c in c_codes3)
        no_water3 = not any("14543" in c for c in c_codes3)

        print(f" - Standards Found: {len(stds3)}")
        print(f" - Top Standard: {c_codes3[0] if c_codes3 else 'None'}")
        print(f" - Match Strength: {stds3[0].get('match_strength') if stds3 else 'None'} (Score: {stds3[0].get('relevance_score') if stds3 else 'None'})")
        print(f" - Cross-Category Clean: {no_cookers3 and no_water3}")

        s3_pass = has_9873 and no_cookers3 and no_water3
        results.append(("Scenario 3: Toys for Children", s3_pass))

        # -------------------------------------------------------------
        # Scenario 4: Electrical Appliance
        # -------------------------------------------------------------
        print("\n[SCENARIO 4] Household Electrical Appliance")
        p4 = {
            "product": "Household Electrical Appliance",
            "category": "Electrical Appliances",
            "material": "Insulated plastic and copper wiring",
            "intended_use": "Domestic electrical power use",
            "description": "General safety requirements for household electrical appliances",
            "language": "en"
        }
        r4 = client.post("/api/v1/standards/search", json=p4)
        d4 = r4.json()
        stds4 = d4.get("standards", [])
        c_codes4 = [s["code"] for s in stds4]

        has_302 = any("302" in c for c in c_codes4)
        no_toys4 = not any("9873" in c for c in c_codes4)
        no_water4 = not any("14543" in c for c in c_codes4)

        print(f" - Standards Found: {len(stds4)}")
        print(f" - Top Standard: {c_codes4[0] if c_codes4 else 'None'}")
        print(f" - Match Strength: {stds4[0].get('match_strength') if stds4 else 'None'} (Score: {stds4[0].get('relevance_score') if stds4 else 'None'})")
        print(f" - Cross-Category Clean: {no_toys4 and no_water4}")

        s4_pass = has_302 and no_toys4 and no_water4
        results.append(("Scenario 4: Electrical Appliance", s4_pass))

        # -------------------------------------------------------------
        # Scenario 5: Unrelated / Unknown Product
        # -------------------------------------------------------------
        print("\n[SCENARIO 5] Unrelated / Unknown Product")
        p5 = {
            "product": "Quantum Warp Propulsion Engine",
            "category": "Aerospace Interstellar",
            "material": "Antimatter plasma",
            "intended_use": "Faster than light travel",
            "language": "en"
        }
        r5 = client.post("/api/v1/standards/search", json=p5)
        d5 = r5.json()
        stds5 = d5.get("standards", [])

        # Chat check
        r5_chat = client.post("/api/v1/chat", json={"message": "Can you design a quantum warp engine for interstellar travel?", "language": "en"})
        d5_chat = r5_chat.json()

        print(f" - Finder Standards Count: {len(stds5)} (Expected 0)")
        print(f" - Insufficient Evidence Guidance: {'Present' if d5.get('clarification_prompt') else 'Missing'}")
        print(f" - Chat Intent: {d5_chat.get('intent')} (Expected unsupported_or_out_of_scope)")
        print(f" - Chat Tool Called: {d5_chat.get('tool_called')} (Expected None)")

        s5_pass = len(stds5) == 0 and d5.get('clarification_prompt') is not None and d5_chat.get('intent') == "unsupported_or_out_of_scope" and d5_chat.get('tool_called') is None
        results.append(("Scenario 5: Unrelated/Unknown Product", s5_pass))

        # -------------------------------------------------------------
        # Flow 6: Certification Guidance
        # -------------------------------------------------------------
        print("\n[FLOW 6] Certification Guidance Flow")
        r6 = client.post("/api/v1/chat", json={"message": "What is the procedure and documentation to get ISI mark certification for domestic products?", "language": "en"})
        d6 = r6.json()
        resp6 = d6.get("response", {})
        has_content = len(resp6.get("steps", [])) > 0 or len(resp6.get("features", [])) > 0 or len(resp6.get("content", "")) > 0
        citations6 = resp6.get("sources", [])

        print(f" - Intent: {d6.get('intent')}")
        print(f" - Tool Called: {d6.get('tool_called')}")
        print(f" - Response Type: {resp6.get('type')}")
        print(f" - Citations Count: {len(citations6)}")
        if citations6:
            print(f" - Source Doc: {citations6[0].get('document_title')} | URL: {citations6[0].get('url')}")

        s6_pass = d6.get('intent') in ["certification_guidance", "scheme_information"] and d6.get('tool_called') in ["get_certification_guidance", "get_scheme_information"] and has_content
        results.append(("Flow 6: Certification Guidance", s6_pass))

        # -------------------------------------------------------------
        # Flow 7: Hallmarking Flow
        # -------------------------------------------------------------
        print("\n[FLOW 7] Gold & Silver Hallmarking Flow")
        r7 = client.post("/api/v1/chat", json={"message": "What are the 3 mandatory marks on gold jewellery and how to verify HUID?", "language": "en"})
        d7 = r7.json()
        resp7 = d7.get("response", {})
        mandatory_marks = resp7.get("mandatory_marks", [])
        citations7 = resp7.get("sources", [])

        print(f" - Intent: {d7.get('intent')}")
        print(f" - Tool Called: {d7.get('tool_called')}")
        print(f" - Mandatory Marks Count: {len(mandatory_marks)}")
        for m in mandatory_marks:
            print(f"   * {m}")
        print(f" - Citations Count: {len(citations7)}")
        if citations7:
            print(f" - Source Doc: {citations7[0].get('document_title')} | URL: {citations7[0].get('url')}")

        s7_pass = d7.get('intent') == "hallmarking" and d7.get('tool_called') == "search_hallmarking_info" and len(mandatory_marks) >= 3
        results.append(("Flow 7: Hallmarking Flow", s7_pass))

        # -------------------------------------------------------------
        # Flow 8: Testing Laboratories Flow
        # -------------------------------------------------------------
        print("\n[FLOW 8] Testing Laboratories Flow")
        r8 = client.post("/api/v1/chat", json={"message": "Find BIS recognized testing laboratories in Sahibabad or Ghaziabad", "language": "en"})
        d8 = r8.json()
        resp8 = d8.get("response", {})
        labs = resp8.get("laboratories", [])
        citations8 = resp8.get("sources", [])

        print(f" - Intent: {d8.get('intent')}")
        print(f" - Tool Called: {d8.get('tool_called')}")
        print(f" - Laboratories Found: {len(labs)}")
        for lab in labs[:2]:
            print(f"   * {lab.get('name')} ({lab.get('location')}) - Recognition: {lab.get('recognition_status')}")

        s8_pass = d8.get('intent') == "testing_laboratory" and d8.get('tool_called') == "find_testing_labs" and len(labs) > 0
        results.append(("Flow 8: Testing Laboratories Flow", s8_pass))

    # -------------------------------------------------------------
    # Summary
    # -------------------------------------------------------------
    print("\n" + "=" * 70)
    print("QA PASS RESULTS SUMMARY")
    print("=" * 70)
    all_passed = True
    for name, status in results:
        mark = "[PASS]" if status else "[FAIL]"
        print(f" {mark} | {name}")
        if not status:
            all_passed = False

    print("=" * 70)
    if all_passed:
        print("ALL 8 SCENARIOS & FLOWS PASSED PERFECTLY!")
    else:
        print("SOME TESTS FAILED - CHECK LOGS ABOVE")
    print("=" * 70)

if __name__ == "__main__":
    run_qa_pass()
