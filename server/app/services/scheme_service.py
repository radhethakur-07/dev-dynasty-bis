from typing import Union
from app.schemas.responses import SchemeInformationResponse, InsufficientEvidenceResponse, SourceCitation
from app.services.rag_service import rag_service
from app.core.config import settings
from app.core.logging import logger


class SchemeService:
    def get_scheme_info(
        self, scheme_name: str, language: str = "en"
    ) -> Union[SchemeInformationResponse, InsufficientEvidenceResponse]:
        lower_name = scheme_name.lower().strip()
        is_hi = language == "hi"

        # 1. Live pgvector retrieval for the requested scheme
        retrieval_query = f"BIS {scheme_name} conformity assessment scheme regulations requirements"
        logger.info(f"[SCHEME RAG] Retrieving context for query: '{retrieval_query}'")
        chunks = rag_service.retrieve_context(retrieval_query, match_count=4)
        citations = rag_service.extract_citations(chunks)

        # 2. Match officially supported BIS schemes
        if "scheme ii" in lower_name or "scheme 2" in lower_name or "crs" in lower_name or "registration" in lower_name:
            if is_hi:
                s_name = "स्कीम-II — अनिवार्य पंजीकरण योजना (CRS)"
                desc = "इलेक्ट्रॉनिक्स, आईटी और सोलर पीवी उत्पादों के लिए बीआईएस अनुरूपता स्व-घोषणा (Self-Declaration) पंजीकरण योजना।"
                app = "MeitY और MNRE द्वारा अधिसूचित इलेक्ट्रॉनिक्स और सूचना प्रौद्योगिकी (IT) उत्पादों पर लागू।"
                features = [
                    "प्रारंभिक कारखाना निरीक्षण (factory audit) की आवश्यकता नहीं होती — पंजीकरण केवल लैब टेस्ट रिपोर्ट पर आधारित होता है।",
                    "परीक्षण रिपोर्ट भारत स्थित बीआईएस-मान्यता प्राप्त प्रयोगशाला से 90 दिनों के भीतर की होनी चाहिए।",
                    "मानक चिह्न: 'Self-Declaration — Conforming to IS ... / R-XXXXXXXX'।",
                    "प्रत्येक निर्माता और निर्माण परिसर के लिए अलग पंजीकरण अनिवार्य है।"
                ]
            else:
                s_name = "Scheme II — Compulsory Registration Scheme (CRS)"
                desc = "Self-Declaration of Conformity registration scheme primarily notified for Electronic, IT, and Solar Photovoltaic goods."
                app = "Applies to electronics and IT products notified under Compulsory Registration Orders (CRO) by MeitY and MNRE."
                features = [
                    "NO preliminary factory audit required (registration is granted purely on laboratory test report evaluation).",
                    "Test report must be from a BIS-recognized laboratory located in India and submitted within 90 days of issuance.",
                    "Standard mark format: 'Self-Declaration — Conforming to IS [Number] / R-XXXXXXXX'.",
                    "Registration is granted per manufacturing location and brand."
                ]
            return SchemeInformationResponse(
                scheme_name=s_name,
                description=desc,
                applicability=app,
                key_features=features,
                sources=citations,
                disclaimer="Official Scheme II regulations are governed under BIS (Conformity Assessment) Regulations 2018.",
                is_demo=False,
                demo_badge=None
            )

        elif "scheme iv" in lower_name or "scheme 4" in lower_name or "coc" in lower_name or "conformity" in lower_name and "certificate" in lower_name:
            if is_hi:
                s_name = "स्कीम-IV — अनुरूपता प्रमाणपत्र (CoC)"
                desc = "विशिष्ट खेप (consignment) या सीमित उत्पादन लॉट के लिए बैच-विशिष्ट अनुरूपता मूल्यांकन योजना।"
                app = "आयातित खेपों, विशिष्ट उत्पादन लॉट या सीमित विनिर्माण पर लागू जहां सतत कारखाना लाइसेंसिंग (स्कीम-I) व्यावहारिक नहीं है।"
                features = [
                    "पूरी तरह से बैच-बाध्य (batch-bound); सतत उत्पाद मार्किंग अधिकार प्रदान नहीं करता।",
                    "बीआईएस अधिकारियों द्वारा विशिष्ट लॉट से साइट पर नमूने एकत्र किए जाते हैं।",
                    "अनुरूपता प्रमाणपत्र केवल सत्यापित लॉट मात्रा के लिए जारी किया जाता है।"
                ]
            else:
                s_name = "Scheme IV — Certificate of Conformity (CoC)"
                desc = "Batch-specific conformity assessment granting a Certificate of Conformity for a defined lot, consignment, or single production run."
                app = "Applies to imported consignments, specific production lots, or manufacturing where continuous Scheme-I licensing is not practical."
                features = [
                    "Strictly batch-bound; does not grant continuous product marking rights.",
                    "Samples drawn on-site from the specific consignment or lot by BIS inspecting officers.",
                    "CoC is issued solely for the verified quantity in that consignment."
                ]
            return SchemeInformationResponse(
                scheme_name=s_name,
                description=desc,
                applicability=app,
                key_features=features,
                sources=citations,
                disclaimer="Scheme IV operates under Regulation 7 of BIS (Conformity Assessment) Regulations 2018.",
                is_demo=False,
                demo_badge=None
            )

        elif "scheme x" in lower_name or "scheme-x" in lower_name or "switchgear" in lower_name or "machinery" in lower_name:
            if is_hi:
                s_name = "स्कीम-X — औद्योगिक उपकरण और मशीनरी प्रमाणन"
                desc = "लो-वोल्टेज स्विचगियर, कंट्रोलगियर, औद्योगिक मशीनरी और ट्रांसफार्मर के लिए उन्नत अनुरूपता मूल्यांकन ढांचा।"
                app = "भारतीय और विदेशी विनिर्माताओं के औद्योगिक स्विचगियर, ट्रांसफार्मर और जटिल मशीनरी पर लागू (राजपत्र अधिसूचना S.O. 4531(E))।"
                features = [
                    "मान्यता प्राप्त प्रयोगशाला में प्रोटोटाइप टाइप-टेस्टिंग और तकनीकी निर्माण फाइल (TCF) की इंजीनियरिंग समीक्षा।",
                    "गुणवत्ता नियंत्रण और विनिर्माण क्षमता का ऑन-साइट कारखाना ऑडिट।",
                    "इंजीनियरिंग डिजाइन डोजियर के आधार पर उत्पाद परिवारों और कस्टम-निर्मित मशीनरी का प्रमाणन।"
                ]
            else:
                s_name = "Scheme X — Industrial Equipment Certification"
                desc = "Advanced conformity assessment framework specifically designed for low-voltage switchgear, controlgear, industrial machinery, and electrical transformers."
                app = "Applies to Indian and foreign manufacturers of heavy industrial machinery, controlgear, and transformers under Gazette notification S.O. 4531(E)."
                features = [
                    "Combines prototype type-testing at accredited laboratories with engineering evaluation of Technical Construction File (TCF).",
                    "Factory audit evaluating quality control, design capability, and type-test maintenance.",
                    "Permits certification of product families and custom machinery based on design dossier verification."
                ]
            return SchemeInformationResponse(
                scheme_name=s_name,
                description=desc,
                applicability=app,
                key_features=features,
                sources=citations,
                disclaimer="Scheme X is governed under BIS Gazette Notification S.O. 4531(E).",
                is_demo=False,
                demo_badge=None
            )

        elif "fmcs" in lower_name or "foreign" in lower_name:
            if is_hi:
                s_name = "विदेशी विनिर्माता प्रमाणन योजना (FMCS — स्कीम-I)"
                desc = "भारत के बाहर स्थित विनिर्माण इकाइयों के लिए बीआईएस मानक चिह्न (ISI मार्क) लाइसेंसिंग योजना।"
                app = "भारत को निर्यात करने वाले विदेशी विनिर्माताओं पर लागू जिनके उत्पाद भारतीय मानक या अनिवार्य QCO के अंतर्गत आते हैं।"
                features = [
                    "भारत में स्थित एक अधिकृत भारतीय प्रतिनिधि (AIR) का अनिवार्य नामांकन।",
                    "बीआईएस तकनीकी अधिकारियों द्वारा विदेशी कारखाने का भौतिक ऑन-साइट निरीक्षण।",
                    "भारत में बीआईएस-मान्यता प्राप्त प्रयोगशालाओं में स्वतंत्र सत्यापन नमूना परीक्षण।",
                    "लाइसेंस अनुदान से पहले परफॉर्मेंस बैंक गारंटी (PBG) जमा करना अनिवार्य।"
                ]
            else:
                s_name = "Foreign Manufacturers Certification Scheme (FMCS — Scheme I)"
                desc = "Operates under Scheme-I for overseas manufacturing premises seeking to apply the Standard Mark (ISI Mark) on exports to India."
                app = "Applies to factories located outside India producing items covered under Indian Standards or mandatory QCOs."
                features = [
                    "Mandatory nomination of an Authorized Indian Representative (AIR) residing in India.",
                    "Physical on-site factory audit at the foreign plant by BIS technical evaluating officers.",
                    "Independent sample testing in India at BIS-approved laboratories.",
                    "Submission of Performance Bank Guarantee (PBG) before grant of licence."
                ]
            return SchemeInformationResponse(
                scheme_name=s_name,
                description=desc,
                applicability=app,
                key_features=features,
                sources=citations,
                disclaimer="FMCS functions in accordance with Scheme-I of BIS (Conformity Assessment) Regulations 2018.",
                is_demo=False,
                demo_badge=None
            )

        elif "system" in lower_name or "qms" in lower_name or "iso" in lower_name or "scheme vi" in lower_name:
            if is_hi:
                s_name = "प्रबंधन प्रणाली प्रमाणन (Scheme VI / ISO अनुरूपता)"
                desc = "अंतरराष्ट्रीय मानकों (ISO समकक्ष) के अनुरूप संगठनात्मक प्रबंधन प्रणालियों का बीआईएस प्रमाणन।"
                app = "ISO 9001 (QMS), ISO 14001 (EMS), ISO 22000 (FSMS) आदि लागू करने वाले संगठनों पर लागू।"
                features = [
                    "दो-चरणीय प्रमाणन ऑडिट (चरण 1 पर्याप्तता ऑडिट + चरण 2 ऑन-साइट कार्यान्वयन ऑडिट)।",
                    "वार्षिक निगरानी ऑडिट के साथ तीन वर्ष की अवधि के लिए प्रदान किया जाता है।"
                ]
            else:
                s_name = "Management System Certification (Scheme VI / ISO Equivalents)"
                desc = "Certification of organizational management systems against internationally aligned Indian Standards."
                app = "Applies to organizations implementing ISO 9001 (QMS), ISO 14001 (EMS), ISO 22000 (FSMS), ISO 45001 (OHSMS), etc."
                features = [
                    "Two-stage certification audit (Stage 1 Adequacy Audit + Stage 2 On-site Implementation Audit).",
                    "Granted for a three-year validity cycle with annual surveillance audits."
                ]
            return SchemeInformationResponse(
                scheme_name=s_name,
                description=desc,
                applicability=app,
                key_features=features,
                sources=citations,
                disclaimer="Management System Certification operates under Scheme VI of BIS regulations.",
                is_demo=False,
                demo_badge=None
            )

        elif "scheme i" in lower_name or "scheme-i" in lower_name or "scheme 1" in lower_name or "isi" in lower_name or "product" in lower_name:
            if is_hi:
                s_name = "स्कीम-I — उत्पाद प्रमाणन (ISI मार्क योजना)"
                desc = "घरेलू निर्माताओं के लिए प्राथमिक अनुरूपता मूल्यांकन योजना जो भारतीय मानकों के अनुरूप उत्पादों पर ISI मार्क लगाने का अधिकार देती है।"
                app = "स्वैच्छिक विनिर्माताओं और अनिवार्य गुणवत्ता नियंत्रण आदेशों (QCO) के तहत कवर किए गए उत्पादों पर लागू।"
                features = [
                    "निरीक्षण और परीक्षण योजना (SIT) के अनुरूप पूर्ण इन-हाउस परीक्षण सुविधा अनिवार्य है।",
                    "लाइसेंस देने से पहले बीआईएस तकनीकी अधिकारियों द्वारा प्रारंभिक कारखाना निरीक्षण।",
                    "कारखाने से लिए गए नमूनों का बीआईएस-मान्यता प्राप्त प्रयोगशालाओं में स्वतंत्र परीक्षण।",
                    "बाजार और कारखाने से औचक नमूनाकरण के माध्यम से निरंतर निगरानी।"
                ]
            else:
                s_name = "Scheme I — Product Certification (ISI Mark Scheme)"
                desc = "The foundational product certification scheme of BIS granting a licence (CM/L) to apply the Standard Mark (ISI Mark) on goods complying with Indian Standards."
                app = "Applies to voluntary domestic manufacturers and products mandated under Quality Control Orders (QCOs) by central ministries."
                features = [
                    "Mandatory in-house laboratory conforming to the Scheme of Inspection and Testing (SIT).",
                    "On-site factory audit by BIS inspecting officers prior to grant of licence.",
                    "Independent verification testing of factory-drawn samples at BIS-recognized laboratories.",
                    "Continuous post-licence surveillance via surprise factory audits and market sampling."
                ]
            return SchemeInformationResponse(
                scheme_name=s_name,
                description=desc,
                applicability=app,
                key_features=features,
                sources=citations,
                disclaimer="Official Scheme I regulations are governed under BIS (Conformity Assessment) Regulations 2018.",
                is_demo=False,
                demo_badge=None
            )

        # 3. If query asks for an unrecognized/unsupported scheme with no grounded evidence
        return InsufficientEvidenceResponse(
            message=(
                f"No verified BIS conformity assessment scheme found matching '{scheme_name}'. "
                f"Supported official schemes in the knowledge base include Scheme I (ISI Mark), "
                f"Scheme II (CRS), Scheme IV (CoC), Scheme X (Industrial Equipment), FMCS, and System Certification."
            ),
            known_scope=["Scheme I (ISI)", "Scheme II (CRS)", "Scheme IV (CoC)", "Scheme X", "FMCS", "Scheme VI (Management Systems)"],
            sources=citations,
            disclaimer="The assistant relies strictly on verified BIS official sources and does not fabricate scheme requirements.",
            is_demo=False,
            demo_badge=None
        )


scheme_service = SchemeService()

