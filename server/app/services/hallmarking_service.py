import json
from pathlib import Path
from app.schemas.responses import HallmarkingResponse, SourceCitation
from app.core.config import settings

KNOWLEDGE_STORE_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "knowledge_store.json"


class HallmarkingService:
    def get_hallmarking_guidance(self, query: str, language: str = "en") -> HallmarkingResponse:
        is_hi = language == "hi"

        # Check if authentic hallmarking guide was ingested
        citations = []
        is_demo = True

        if KNOWLEDGE_STORE_FILE.exists():
            try:
                with open(KNOWLEDGE_STORE_FILE, "r", encoding="utf-8") as f:
                    store = json.load(f)
                    chunks = [c for c in store.get("chunks", []) if "hallmark" in c.get("document_title", "").lower()]
                    if chunks:
                        is_demo = False
                        seen_sections = set()
                        for c in chunks:
                            sec = c.get("section", "FAQ")
                            if sec not in seen_sections:
                                seen_sections.add(sec)
                                citations.append(
                                    SourceCitation(
                                        document_title="BIS Official Hallmarking & HUID Guidelines",
                                        section=sec,
                                        page_number=c.get("page_number", 1),
                                        url=c.get("source_url", "https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/"),
                                        is_demo=False,
                                        demo_badge=None
                                    )
                                )
            except Exception:
                pass

        if not citations:
            citations = [
                SourceCitation(
                    document_title="BIS Hallmarking Scheme & Guidelines (Demo Reference)",
                    section="Consumer Awareness & HUID Verification",
                    page_number=1,
                    url="https://www.bis.gov.in/hallmarking-overview",
                    is_demo=True,
                    demo_badge=settings.DEMO_DATA_NOTICE
                )
            ]

        if is_hi:
            summary = "बीआईएस हॉलमार्किंग सोने और चांदी के आभूषणों की शुद्धता का आधिकारिक प्रमाण है (1 जुलाई 2021 से 3 अनिवार्य चिह्न)।"
            verification_steps = [
                "आभूषण पर 3 अनिवार्य चिह्न अवश्य देखें: (1) बीआईएस लोगो (त्रिकोण), (2) शुद्धता व सुंदरता (उदा. 22K916), (3) 6-अंकीय HUID संख्या।",
                "गूगल प्ले स्टोर या एप्पल ऐप स्टोर से आधिकारिक 'BIS CARE' ऐप डाउनलोड करें।",
                "ऐप में 'Verify HUID' विकल्प चुनें और आभूषण पर लेजर से अंकित 6-अंकीय HUID कोड दर्ज करें।",
                "ज्वेलर का पंजीकरण, हॉलमार्किंग केंद्र का नाम और आभूषण के प्रकार का मिलान करें।"
            ]
            disclaimer = "हॉलमार्किंग नियम आधिकारिक बीआईएस सार्वजनिक जानकारी पर आधारित हैं। प्रामाणिकता की जांच बीआईएस केयर ऐप द्वारा की जा सकती है।"
        else:
            summary = "Official BIS Hallmarking specifies purity standards for gold and silver articles with 3 mandatory marks since 1 July 2021."
            verification_steps = [
                "Inspect the article for the 3 mandatory marks: (1) BIS Logo (Triangle), (2) Purity in Carat & Fineness (e.g. 22K916), (3) 6-digit alphanumeric HUID code.",
                "Download the official 'BIS CARE' mobile app from Google Play Store or Apple App Store.",
                "Navigate to the 'Verify HUID' feature on the app home screen.",
                "Enter the unique 6-digit alphanumeric code laser-inscribed on the jewellery item.",
                "Verify that the displayed jewellery type, jeweller registration, and assaying center match your purchase invoice."
            ]
            disclaimer = "Hallmarking guidelines reflect official BIS documentation. Consumers should verify HUID authenticity via the BIS CARE mobile application."

        return HallmarkingResponse(
            summary=summary,
            consumer_verification_steps=verification_steps,
            sources=citations,
            disclaimer=disclaimer,
            is_demo=is_demo,
            demo_badge=settings.DEMO_DATA_NOTICE if is_demo else None
        )


hallmarking_service = HallmarkingService()
