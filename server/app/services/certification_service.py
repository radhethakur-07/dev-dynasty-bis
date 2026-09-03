from typing import Optional
from app.schemas.responses import (
    CertificationGuidanceResponse,
    CertificationStepItem,
    SourceCitation
)
from app.core.config import settings


class CertificationService:
    def get_guidance(self, product: str, scheme: Optional[str] = None, language: str = "en") -> CertificationGuidanceResponse:
        is_hi = language == "hi"

        if is_hi:
            summary = f"उत्पाद '{product}' के लिए बीआईएस अनुरूपता मूल्यांकन प्रक्रिया का चरणबद्ध विवरण।"
            steps = [
                CertificationStepItem(
                    step_number=1,
                    title="मानक और योजना की पहचान",
                    description=f"उत्पाद '{product}' के लिए लागू भारतीय मानक विनिर्देश और उपयुक्त प्रमाणन योजना (जैसे स्कीम-I ISI मार्क) की पुष्टि करें।",
                    important_notes="Manakonline पोर्टल पर नवीनतम राजपत्र अधिसूचनाओं की जांच करें।"
                ),
                CertificationStepItem(
                    step_number=2,
                    title="इन-हाउस परीक्षण और बुनियादी ढांचा तैयारी",
                    description="लागू मानक के अनुसार विनिर्माण स्थल पर आवश्यक परीक्षण सुविधाएं और गुणवत्ता नियंत्रण प्रणाली स्थापित करें।"
                ),
                CertificationStepItem(
                    step_number=3,
                    title="Manakonline पर ऑनलाइन आवेदन",
                    description="आधिकारिक बीआईएस पोर्टल (www.manakonline.in) पर विनिर्माण विवरण, मशीनरी सूची और गुणवत्ता योजना के साथ आवेदन जमा करें।"
                ),
                CertificationStepItem(
                    step_number=4,
                    title="कारखाना निरीक्षण और नमूना परीक्षण",
                    description="बीआईएस अधिकारी विनिर्माण स्थल का निरीक्षण करते हैं और स्वतंत्र परीक्षण के लिए नमूने एकत्र करते हैं।"
                ),
                CertificationStepItem(
                    step_number=5,
                    title="लाइसेंस अनुदान (ISI मार्क)",
                    description="सफल तकनीकी और परीक्षण अनुपालन पर मानक चिह्न का उपयोग करने के लिए लाइसेंस प्रदान किया जाता है।"
                )
            ]
            req_docs = [
                "कारखाना पंजीकरण / एमएसएमई प्रमाणपत्र",
                "विनिर्माण मशीनरी की सूची",
                "परीक्षण उपकरण और अंशांकन प्रमाणपत्र",
                "गुणवत्ता नियंत्रण योजना"
            ]
            disclaimer = "यह केवल प्रक्रियात्मक मार्गदर्शन है। आधिकारिक बीआईएस अधिसूचनाओं के आधार पर आवश्यकताओं और लागू शुल्कों की पुष्टि करें।"
        else:
            summary = f"Step-by-step BIS conformity assessment and licensing procedure for '{product}'."
            steps = [
                CertificationStepItem(
                    step_number=1,
                    title="Identify Applicable Standard & Scheme",
                    description=f"Verify the relevant Indian Standard and certification scheme (such as Scheme-I ISI Mark or CRS) applicable to '{product}'.",
                    important_notes="Check latest notifications on the official Manakonline portal."
                ),
                CertificationStepItem(
                    step_number=2,
                    title="Factory Infrastructure & In-House Testing Setup",
                    description="Ensure manufacturing premises possess required manufacturing machinery and in-house testing equipment in accordance with the Scheme of Inspection and Testing (SIT)."
                ),
                CertificationStepItem(
                    step_number=3,
                    title="Online Application Submission via Manakonline",
                    description="Submit the application on www.manakonline.in along with factory layout, test capabilities, and manufacturing details."
                ),
                CertificationStepItem(
                    step_number=4,
                    title="Factory Audit & Sample Extraction",
                    description="A designated BIS auditor visits the manufacturing premises to verify infrastructure and draws representative samples for independent lab testing."
                ),
                CertificationStepItem(
                    step_number=5,
                    title="Grant of License",
                    description="Upon satisfactory audit findings and conforming test reports, BIS grants the certification license to use the Standard Mark."
                )
            ]
            req_docs = [
                "Proof of factory establishment / MSME registration",
                "List of manufacturing machinery and process flow chart",
                "List of in-house testing equipment with valid calibration certificates",
                "Consent letter / undertaking regarding quality control personnel"
            ]
            disclaimer = "This is procedural guidance based on available documentation. Exact compliance criteria and statutory fees must be confirmed directly with BIS."

        citations = [
            SourceCitation(
                document_title="BIS Product Certification Scheme Overview (Demo Reference)",
                section="Conformity Assessment Guidelines",
                page_number=3,
                url="https://www.manakonline.in",
                is_demo=True,
                demo_badge=settings.DEMO_DATA_NOTICE
            )
        ]

        return CertificationGuidanceResponse(
            product=product,
            scheme_name=scheme or "Scheme I (ISI Certification)",
            summary=summary,
            steps=steps,
            required_documents=req_docs,
            sources=citations,
            disclaimer=disclaimer,
            is_demo=True,
            demo_badge=settings.DEMO_DATA_NOTICE
        )


certification_service = CertificationService()
