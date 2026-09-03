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
            # Honest data gap: Silver hallmarking is not in the current ingested knowledge base
            if is_hi:
                summary = (
                    "वर्तमान सत्यापित बीआईएस ज्ञान आधार में केवल सोने के आभूषणों की हॉलमार्किंग और HUID संबंधी अधिकृत दस्तावेज अनुक्रमित हैं। "
                    "चांदी की हॉलमार्किंग (IS 2112) से संबंधित अधिकृत स्रोत सामग्री अभी इस रिपॉजिटरी में शामिल नहीं की गई है।"
                )
                disclaimer = "चांदी के आभूषणों के विनिर्देशों के लिए आधिकारिक बीआईएस पोर्टल (bis.gov.in) देखें। सोने के नियमों को चांदी पर लागू न समझें।"
            else:
                summary = (
                    "The current verified BIS knowledge base contains official documentation for Gold jewellery hallmarking and HUID verification only. "
                    "Authoritative specifications and purity grades for Silver hallmarking (e.g., IS 2112) have not yet been ingested into this repository."
                )
                disclaimer = "For official silver hallmarking specifications, consult bis.gov.in. Do not infer gold hallmarking caratage rules for silver articles."

            return HallmarkingResponse(
                summary=summary,
                precious_metal="Silver (Data Gap)",
                mandatory_marks=[],
                purity_grades=[],
                consumer_verification_steps=[
                    "Consult official BIS notification on silver hallmarking on bis.gov.in.",
                    "Verify assaying and hallmarking centre recognition status on the BIS portal."
                ],
                sources=citations,
                disclaimer=disclaimer,
                is_demo=has_demo,
                demo_badge=settings.DEMO_DATA_NOTICE if has_demo else None
            )

        # 3. Grounded Gold & HUID facts from retrieved knowledge chunks
        if is_hi:
            summary = "बीआईएस आधिकारिक रिकॉर्ड के अनुसार, 1 जुलाई 2021 से सोने के आभूषणों पर 3 अनिवार्य चिह्न (BIS लोगो, शुद्धता/कैरेट, और 6-अंकीय HUID) लागू हैं।"
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