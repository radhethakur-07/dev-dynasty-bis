from app.schemas.responses import HallmarkingResponse, SourceCitation
from app.core.config import settings


class HallmarkingService:
    def get_hallmarking_guidance(self, query: str, language: str = "en") -> HallmarkingResponse:
        is_hi = language == "hi"

        if is_hi:
            summary = "बीआईएस हॉलमार्किंग सोने और चांदी के आभूषणों की शुद्धता का आधिकारिक प्रमाण है।"
            verification_steps = [
                "आभूषण पर 3 अनिवार्य चिह्न अवश्य देखें: (1) बीआईएस लोगो (त्रिकोण), (2) शुद्धता ग्रेड (उदा. 22K916), (3) 6-अंकीय HUID संख्या।",
                "बीआईएस केयर (BIS CARE) मोबाइल ऐप डाउनलोड करें।",
                "ऐप में 'Verify HUID' विकल्प चुनें और आभूषण पर लेजर से अंकित 6-अंकीय कोड दर्ज करें।",
                "ज्वेलर का पंजीकरण, हॉलमार्किंग केंद्र का नाम और आभूषण के प्रकार का मिलान करें।"
            ]
            disclaimer = "हॉलमार्किंग नियम बीआईएस दिशानिर्देशों पर आधारित हैं। प्रामाणिकता की जांच बीआईएस केयर ऐप द्वारा की जा सकती है।"
        else:
            summary = "BIS Hallmarking is the official certification of purity and fineness of precious metal articles."
            verification_steps = [
                "Inspect the article for the 3 mandatory marks: (1) BIS Logo (Triangle), (2) Purity & Fineness (e.g. 22K916), (3) 6-digit alphanumeric HUID code.",
                "Download the official 'BIS CARE' mobile app from Google Play Store or Apple App Store.",
                "Navigate to the 'Verify HUID' feature on the app home screen.",
                "Enter the unique 6-digit alphanumeric code laser-inscribed on the jewellery item.",
                "Verify that the displayed jewellery type, jeweller registration, and assaying center match your purchase invoice."
            ]
            disclaimer = "Hallmarking guidelines reflect official BIS standards. Consumers should verify the HUID via the BIS CARE mobile application."

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

        return HallmarkingResponse(
            summary=summary,
            consumer_verification_steps=verification_steps,
            sources=citations,
            disclaimer=disclaimer,
            is_demo=True,
            demo_badge=settings.DEMO_DATA_NOTICE
        )


hallmarking_service = HallmarkingService()
