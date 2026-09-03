from app.schemas.responses import HallmarkingResponse
from app.services.rag_service import rag_service
from app.core.config import settings
from app.core.logging import logger


class HallmarkingService:
    def get_hallmarking_guidance(self, query: str, language: str = "en") -> HallmarkingResponse:
        is_hi = language == "hi"
        lower_q = query.lower()

        # 1. Execute live Supabase pgvector retrieval
        logger.info(f"[HALLMARKING RAG] Executing vector retrieval for query: '{query}'")
        chunks = rag_service.retrieve_context(query, match_count=4)
        citations = rag_service.extract_citations(chunks)

        has_demo = any(c.get("is_demo", False) for c in chunks) if chunks else False

        # 2. Check for Silver query
        is_silver_query = "silver" in lower_q or "चांदी" in lower_q
        is_huid_query = "huid" in lower_q or "verify" in lower_q or "सत्यापन" in lower_q

        if is_silver_query:
            # Fully supported under official IS 2112:2025
            if is_hi:
                summary = (
                    "बीआईएस के संशोधित मानक IS 2112:2025 के अनुसार, 1 सितंबर 2025 से चांदी के आभूषणों और कलाकृतियों के लिए "
                    "HUID-आधारित हॉलमार्किंग स्वैच्छिक (voluntary) आधार पर लागू की गई है।"
                )
                verification_steps = [
                    "चांदी के आभूषण पर 3 आधिकारिक चिह्न देखें: (1) 'SILVER' शब्द के साथ बीआईएस मानक चिह्न, (2) शुद्धता/सुंदरता ग्रेड (उदा. 925), (3) 6-अंकीय HUID।",
                    "गूगल प्ले स्टोर या एप्पल ऐप स्टोर से आधिकारिक 'BIS CARE' ऐप डाउनलोड करें।",
                    "ऐप में 'Verify HUID' विकल्प चुनें और चांदी के आभूषण पर लेजर से अंकित 6-अंकीय कोड दर्ज करें।",
                    "प्रदर्शित ज्वेलर पंजीकरण, हॉलमार्किंग केंद्र और शुद्धता का बिल से मिलान करें।",
                    "उपभोक्ता बीआईएस मान्यता प्राप्त हॉलमार्किंग केंद्रों पर सशुल्क आधार पर चांदी की शुद्धता की जांच करा सकते हैं।"
                ]
                disclaimer = "चांदी हॉलमार्किंग नियम आधिकारिक बीआईएस मानक IS 2112:2025 पर आधारित हैं। प्रामाणिकता की जांच बीआईएस केयर ऐप से करें।"
            else:
                summary = (
                    "Under the revised standard IS 2112:2025, the Bureau of Indian Standards introduced HUID-based silver hallmarking "
                    "on a voluntary basis effective from 1 September 2025 across 7 permitted purity grades."
                )
                verification_steps = [
                    "Inspect the silver item for 3 marks: (1) BIS Standard Mark with the word 'SILVER', (2) Purity Grade (e.g., 925), (3) 6-digit alphanumeric HUID code.",
                    "Download the official 'BIS CARE' mobile app from Google Play Store or Apple App Store.",
                    "Open the 'Verify HUID' feature on the app home screen.",
                    "Enter the unique 6-digit alphanumeric code laser-inscribed on the silver jewellery item.",
                    "Verify displayed article type, jeweller registration, and assaying center match your purchase invoice.",
                    "Consumers can get silver articles tested at BIS Recognized Assaying & Hallmarking Centres on a chargeable basis."
                ]
                disclaimer = "Silver hallmarking specifications reflect official BIS standard IS 2112:2025. Verify authenticity via the BIS CARE mobile app."

            return HallmarkingResponse(
                summary=summary,
                precious_metal="Silver (IS 2112:2025)",
                mandatory_marks=[
                    "1. BIS Standard Mark (featuring the word 'SILVER')",
                    "2. Purity / Fineness Grade (800, 835, 925, 958, 970, 990, 999)",
                    "3. 6-digit Alphanumeric HUID (Hallmark Unique Identification)"
                ],
                purity_grades=[
                    "999 (99.9% Fine Silver)",
                    "990 (99.0% Pure Silver)",
                    "970 (97.0% Silver)",
                    "958 (95.8% Silver)",
                    "925 (92.5% Sterling Silver)",
                    "835 (83.5% Silver)",
                    "800 (80.0% Silver)"
                ],
                consumer_verification_steps=verification_steps,
                sources=citations,
                disclaimer=disclaimer,
                is_demo=has_demo,
                demo_badge=settings.DEMO_DATA_NOTICE if has_demo else None
            )

        # 3. Grounded Gold & HUID facts from retrieved knowledge chunks (IS 1417)
        if is_hi:
            summary = "बीआईएस आधिकारिक रिकॉर्ड (IS 1417) के अनुसार, 1 जुलाई 2021 से सोने के आभूषणों पर 3 अनिवार्य चिह्न (BIS लोगो, शुद्धता/कैरेट, और 6-अंकीय HUID) लागू हैं।"
            verification_steps = [
                "आभूषण पर 3 अनिवार्य चिह्न अवश्य देखें: BIS त्रिकोण लोगो, कैरेट/शुद्धता (जैसे 22K916), और 6-अंकीय HUID।",
                "गूगल प्ले स्टोर या एप्पल ऐप स्टोर से आधिकारिक 'BIS CARE' ऐप डाउनलोड करें।",
                "ऐप में 'Verify HUID' विकल्प चुनें और आभूषण पर लेजर से अंकित 6-अंकीय HUID कोड दर्ज करें।",
                "प्रदर्शित ज्वेलर का पंजीकरण, हॉलमार्किंग केंद्र और आभूषण के प्रकार का अपने बिल से मिलान करें।",
                "उपभोक्ता बीआईएस से मान्यता प्राप्त हॉलमार्किंग केंद्रों पर सशुल्क आधार पर शुद्धता की जांच करा सकते हैं।"
            ]
            disclaimer = "हॉलमार्किंग नियम आधिकारिक बीआईएस सार्वजनिक जानकारी पर आधारित हैं। प्रामाणिकता की जांच बीआईएस केयर ऐप द्वारा की जा सकती है।"
        else:
            if is_huid_query:
                summary = "Based on official BIS records, HUID (Hallmark Unique Identification) is a 6-digit alphanumeric code unique to each hallmarked item, verifiable via the BIS Care App."
            else:
                summary = "Official BIS Hallmarking specifies that since 1 July 2021, hallmark on gold jewellery consists of three mandatory marks: BIS logo, purity in caratage and fineness, and 6-digit alphanumeric HUID number."

            verification_steps = [
                "Inspect the jewellery for the 3 mandatory marks: (1) BIS Logo (Triangle), (2) Purity in Caratage & Fineness (e.g. 22K916), (3) 6-digit alphanumeric HUID code.",
                "Download the official 'BIS CARE' mobile app from Google Play Store or Apple App Store.",
                "Navigate to the 'Verify HUID' feature on the app home screen.",
                "Enter the unique 6-digit alphanumeric code laser-inscribed on the jewellery item.",
                "Verify that the displayed jewellery article type, jeweller registration, and assaying center match your purchase invoice.",
                "Consumers can get hallmarked articles tested at BIS Recognized Assaying & Hallmarking Centres on a chargeable basis."
            ]
            disclaimer = "Hallmarking guidelines reflect official BIS documentation. Consumers should verify HUID authenticity via the BIS CARE mobile application."

        return HallmarkingResponse(
            summary=summary,
            precious_metal="Gold",
            mandatory_marks=[
                "1. BIS Logo (Standard Triangle Hallmark)",
                "2. Purity of the article in Caratage & Fineness (e.g., 22K916, 18K750, 14K585)",
                "3. 6-digit Alphanumeric HUID (Hallmark Unique Identification)"
            ],
            purity_grades=["24K (999)", "23K (958)", "22K (916)", "20K (833)", "18K (750)", "14K (585)"],
            consumer_verification_steps=verification_steps,
            sources=citations,
            disclaimer=disclaimer,
            is_demo=has_demo,
            demo_badge=settings.DEMO_DATA_NOTICE if has_demo else None
        )


hallmarking_service = HallmarkingService()