from typing import Optional, List
from app.schemas.responses import (
    CertificationGuidanceResponse,
    CertificationStepItem,
    SourceCitation
)
from app.services.rag_service import rag_service
from app.core.config import settings
from app.core.logging import logger


class CertificationService:
    def get_guidance(self, product: str, scheme: Optional[str] = None, language: str = "en") -> CertificationGuidanceResponse:
        is_hi = language == "hi"
        scheme_str = (scheme or "").strip()
        lower_scheme = scheme_str.lower()
        lower_prod = (product or "").lower()

        # 1. Build specific retrieval query and execute live vector retrieval from Supabase pgvector
        retrieval_query = f"{scheme_str} certification requirements and procedure for {product}".strip()
        logger.info(f"[CERTIFICATION RAG] Retrieving context for query: '{retrieval_query}'")
        chunks = rag_service.retrieve_context(retrieval_query, match_count=4)
        citations = rag_service.extract_citations(chunks)

        has_demo = any(c.get("is_demo", False) for c in chunks) if chunks else False
        doc_names = list(set(c.get("document_title") for c in chunks if c.get("document_title")))
        evidence_summary = (
            f"{len(chunks)} official BIS knowledge chunks retrieved from {', '.join(doc_names)}."
            if chunks else "0 knowledge chunks retrieved."
        )

        # 2. Scheme II (CRS — Compulsory Registration Scheme)
        if "scheme ii" in lower_scheme or "scheme 2" in lower_scheme or "crs" in lower_scheme:
            if is_hi:
                scheme_name = "स्कीम-II — अनिवार्य पंजीकरण योजना (CRS)"
                summary = f"इलेक्ट्रॉनिक्स और आईटी उत्पादों ('{product}') के लिए बीआईएस स्कीम-II (CRS) अनुरूपता स्व-घोषणा प्रक्रिया।"
                applicability = "MeitY और MNRE द्वारा अधिसूचित इलेक्ट्रॉनिक्स, सूचना प्रौद्योगिकी (IT) और सोलर पीवी उत्पादों पर लागू होता है।"
                applicable_prods = [
                    "लैपटॉप और नोटबुक (IS 13252 Part 1)",
                    "मोबाइल फोन और टैबलेट (IS 13252 Part 1)",
                    "सेकेंडरी लिथियम-आयन बैटरी / पावर बैंक (IS 16046 Part 2)",
                    "पावर एडेप्टर और चार्जर (IS 13252 Part 1)",
                    "एलईडी ल्यूमिनेयर और ड्राइवर (IS 15885 / IS 16102)"
                ]
                testing_info = "स्कीम-II में कोई प्रारंभिक कारखाना निरीक्षण (factory audit) नहीं होता है। पंजीकरण पूरी तरह से भारत में बीआईएस मान्यता प्राप्त प्रयोगशाला की परीक्षण रिपोर्ट पर आधारित होता है। परीक्षण रिपोर्ट 90 दिनों से अधिक पुरानी नहीं होनी चाहिए।"
                steps = [
                    CertificationStepItem(
                        step_number=1,
                        title="बीआईएस मान्यता प्राप्त प्रयोगशाला में उत्पाद परीक्षण",
                        description="भारत स्थित बीआईएस-मान्यता प्राप्त प्रयोगशाला में लागू भारतीय मानक (जैसे IS 13252) के अनुसार नमूने का परीक्षण कराएं।"
                    ),
                    CertificationStepItem(
                        step_number=2,
                        title="परीक्षण रिपोर्ट प्राप्ति (90 दिनों की वैधता)",
                        description="सफल परीक्षण के बाद अधिकृत परीक्षण रिपोर्ट प्राप्त करें। रिपोर्ट जारी होने के 90 दिनों के भीतर बीआईएस में प्रस्तुत की जानी चाहिए।"
                    ),
                    CertificationStepItem(
                        step_number=3,
                        title="CRS पोर्टल पर ऑनलाइन पंजीकरण आवेदन",
                        description="www.crsbis.in पोर्टल पर निर्माता विवरण, परीक्षण रिपोर्ट, और भारतीय मानक के अनुरूपता की स्व-घोषणा के साथ आवेदन जमा करें।"
                    ),
                    CertificationStepItem(
                        step_number=4,
                        title="पंजीकरण संख्या आवंटन (R-XXXXXXXX)",
                        description="दस्तावेजों के सत्यापन के बाद, बीआईएस एक अद्वितीय पंजीकरण संख्या (R-नंबर) जारी करता है जिसे उत्पाद पर 'Self-Declaration' मानक चिह्न के साथ अंकित किया जाता है।"
                    )
                ]
                req_docs = [
                    "बीआईएस मान्यता प्राप्त प्रयोगशाला से मूल परीक्षण रिपोर्ट (<90 दिन पुरानी)",
                    "भारतीय मानक के अनुरूपता का स्व-घोषणा हलफनामा",
                    "ब्रांड प्राधिकरण पत्र और ट्रेडमार्क पंजीकरण प्रमाण",
                    "निर्माता का वैध व्यवसाय पंजीकरण"
                ]
                important_notes = [
                    "मानक चिह्न प्रारूप: 'Self-Declaration — Conforming to IS [Number] / R-XXXXXXXX'।",
                    "MeitY CRO आदेशों के तहत गैर-पंजीकृत अधिसूचित आईटी सामान बेचना, आयात करना या वितरित करना कानूनन अपराध है।"
                ]
            else:
                scheme_name = "Scheme II — Compulsory Registration Scheme (CRS)"
                summary = f"BIS Scheme-II (CRS) Self-Declaration of Conformity process for electronics & IT equipment ('{product}')."
                applicability = "Applies primarily to Electronic, Information Technology (IT), and Solar Photovoltaic goods notified under Compulsory Registration Orders (CRO) by MeitY and MNRE."
                applicable_prods = [
                    "Laptops, Notebooks & Tablets (IS 13252 Part 1:2010)",
                    "Mobile Phones & Smart Watches (IS 13252 Part 1:2010)",
                    "Secondary Lithium-ion Batteries & Power Banks (IS 16046 Part 2:2018)",
                    "Power Adapters & LED Drivers (IS 13252 / IS 15885)",
                    "Point of Sale (POS) Terminals & Smart Card Readers"
                ]
                testing_info = "Unlike Scheme-I, Scheme-II requires NO preliminary factory audit. Registration is granted purely on product testing evaluation from a BIS-recognized laboratory located in India. Test reports must be submitted within 90 days of issuance."
                steps = [
                    CertificationStepItem(
                        step_number=1,
                        title="Sample Testing at BIS-Recognized Laboratory",
                        description=f"Submit product sample of '{product}' to a BIS-recognized test laboratory in India for safety testing against the applicable Indian Standard (e.g. IS 13252)."
                    ),
                    CertificationStepItem(
                        step_number=2,
                        title="Obtain Test Report (<90 Days Validity)",
                        description="Receive the conforming test report from the laboratory. The report must be submitted to BIS within 90 days of its issuance date."
                    ),
                    CertificationStepItem(
                        step_number=3,
                        title="Online Registration via CRS Portal",
                        description="Apply digitally on www.crsbis.in with company profile, test report, brand authorization, and self-declaration affidavit of conformity."
                    ),
                    CertificationStepItem(
                        step_number=4,
                        title="Grant of Registration Number (R-XXXXXXXX)",
                        description="Upon automated document verification, BIS grants a unique 8-digit Registration Number (e.g. R-XXXXXXXX) allowing the application of the CRS Standard Mark."
                    )
                ]
                req_docs = [
                    "Original test report from BIS-recognized laboratory (<90 days old)",
                    "Self-declaration affidavit of conformity with the Indian Standard",
                    "Brand Owner authorization letter & Trademark Registration certificate",
                    "Manufacturing facility business license / legal establishment proof"
                ]
                important_notes = [
                    "Standard Mark display format: 'Self-Declaration — Conforming to IS [Number] / R-XXXXXXXX'.",
                    "Importing, distributing, or selling non-registered notified electronic goods is strictly prohibited under MeitY CRO."
                ]

        # 3. Scheme IV (Certificate of Conformity — CoC)
        elif "scheme iv" in lower_scheme or "scheme 4" in lower_scheme or "coc" in lower_scheme or "conformity" in lower_scheme:
            if is_hi:
                scheme_name = "स्कीम-IV — अनुरूपता प्रमाणपत्र (CoC)"
                summary = f"विशिष्ट बैच या खेप के लिए बीआईएस स्कीम-IV अनुरूपता प्रमाणपत्र (CoC) प्रक्रिया।"
                applicability = "विशिष्ट बैचों, खेपों या सीमित निर्माण runs पर लागू होता है जहां निरंतर कारखाना विनिर्माण लाइसेंस (स्कीम-I) व्यावहारिक नहीं है।"
                applicable_prods = [
                    "विशिष्ट आयातित खेप (Import Consignments)",
                    "सीमित उत्पादन बैच (Limited Run Batches)",
                    "वैधानिक आदेशों के तहत विशेष घटक"
                ]
                testing_info = "बीआईएस निरीक्षकों द्वारा स्थल पर खेप के प्रतिनिधि नमूनों का आहरण और अनुमोदित प्रयोगशाला में परीक्षण किया जाता है।"
                steps = [
                    CertificationStepItem(
                        step_number=1,
                        title="खेप और बैच विवरण आवेदन",
                        description="आयात या विनिर्माण बैच के चालान, पैकिंग सूची और तकनीकी विनिर्देशों के साथ आवेदन जमा करें।"
                    ),
                    CertificationStepItem(
                        step_number=2,
                        title="बीआईएस द्वारा भौतिक निरीक्षण और नमूना आहरण",
                        description="बीआईएस अधिकारी निर्दिष्ट खेप का भौतिक सत्यापन करते हैं और परीक्षण के लिए प्रतिनिधि नमूने एकत्र करते हैं।"
                    ),
                    CertificationStepItem(
                        step_number=3,
                        title="प्रयोगशाला परीक्षण",
                        description="एकत्रित नमूनों का लागू भारतीय मानक के अनुसार मान्यता प्राप्त प्रयोगशाला में परीक्षण किया जाता है।"
                    ),
                    CertificationStepItem(
                        step_number=4,
                        title="अनुरूपता प्रमाणपत्र (CoC) जारी करना",
                        description="सफल परीक्षण पर केवल उस विशिष्ट बैच या खेप की मात्रा को कवर करने वाला CoC जारी किया जाता है।"
                    )
                ]
                req_docs = [
                    "खेप चालान, पैकिंग सूची और लदान बिल (Bill of Lading)",
                    "बैच विनिर्माण विनिर्देश और मात्रा घोषणा पत्र",
                    "गुणवत्ता नियंत्रण दस्तावेज"
                ]
                important_notes = [
                    "CoC केवल सत्यापित खेप की सटीक मात्रा के लिए वैध है; यह भविष्य के उत्पादन के लिए मानक चिह्न लगाने का अधिकार नहीं देता है।",
                    "प्रत्येक नई खेप के लिए अलग से नमूना आहरण और परीक्षण आवश्यक है।"
                ]
            else:
                scheme_name = "Scheme IV — Certificate of Conformity (CoC)"
                summary = f"BIS Scheme-IV Certificate of Conformity procedure for specific product batches or consignments ('{product}')."
                applicability = "Applies to specific consignments, production lots, or limited manufacturing runs where a continuous manufacturing license (Scheme-I) is impractical or not applicable."
                applicable_prods = [
                    "Imported consignments requiring statutory one-time clearance",
                    "Limited-run production batches of specialized items",
                    "Statutory components under specific regulatory notifications"
                ]
                testing_info = "Batch/consignment sampling conducted directly by BIS inspectors on-site, followed by testing of representative samples in a BIS-approved laboratory."
                steps = [
                    CertificationStepItem(
                        step_number=1,
                        title="Application with Consignment / Batch Details",
                        description=f"Submit application detailing the specific consignment or production batch of '{product}', including commercial invoices and shipping documents."
                    ),
                    CertificationStepItem(
                        step_number=2,
                        title="On-Site Inspection & Representative Sampling",
                        description="Designated BIS officers inspect the physical consignment and draw representative random samples according to the Indian Standard sampling plan."
                    ),
                    CertificationStepItem(
                        step_number=3,
                        title="Consignment Laboratory Testing",
                        description="Drawn samples are sealed and tested against the applicable standard specifications in a BIS-recognized testing laboratory."
                    ),
                    CertificationStepItem(
                        step_number=4,
                        title="Issuance of Certificate of Conformity",
                        description="Upon passing laboratory results, BIS issues a Certificate of Conformity covering strictly the verified batch/consignment quantity."
                    )
                ]
                req_docs = [
                    "Commercial invoice, packing list, and bill of lading / airway bill",
                    "Consignment quantity declaration and batch numbering details",
                    "Manufacturer technical specification sheet"
                ]
                important_notes = [
                    "CoC is strictly batch-bound and does NOT grant continuous marking rights for future production.",
                    "Each import consignment or batch requires an independent sampling and testing clearance."
                ]

        # 4. Scheme X (Industrial Machinery, Switchgear & Transformers)
        elif "scheme x" in lower_scheme or "scheme 10" in lower_scheme:
            if is_hi:
                scheme_name = "स्कीम-X — औद्योगिक मशीनरी और उपकरण प्रमाणन"
                summary = f"भारी औद्योगिक मशीनरी, लो-वोल्टेज स्विचगियर और ट्रांसफार्मर ('{product}') के लिए बीआईएस स्कीम-X प्रमाणन।"
                applicability = "लो-वोल्टेज स्विचगियर और कंट्रोलगियर, औद्योगिक मशीनरी, ट्रांसफार्मर और जटिल विद्युत उपकरणों के निर्माताओं पर लागू होता है।"
                applicable_prods = [
                    "लो-वोल्टेज स्विचगियर और कंट्रोलगियर असेंबली",
                    "औद्योगिक मशीनरी और संयंत्र उपकरण",
                    "विद्युत ट्रांसफार्मर और घूर्णन मशीनें"
                ]
                testing_info = "मान्यता प्राप्त प्रयोगशालाओं में उत्पाद प्रोटोटाइप का व्यापक टाइप-परीक्षण (type-testing), तकनीकी निर्माण फाइल का मूल्यांकन, और कारखाना लेखापरीक्षा।"
                steps = [
                    CertificationStepItem(
                        step_number=1,
                        title="तकनीकी निर्माण फाइल और डिजाइन समीक्षा",
                        description="इंजीनियरिंग डिजाइन, वायरिंग आरेख, सुरक्षा जोखिम मूल्यांकन और सामग्री के बिल (BOM) के साथ तकनीकी फाइल तैयार करें।"
                    ),
                    CertificationStepItem(
                        step_number=2,
                        title="प्रोटोटाइप टाइप-परीक्षण",
                        description="लागू भारतीय मानकों के अनुसार बीआईएस मान्यता प्राप्त प्रयोगशाला में व्यापक टाइप-परीक्षण कराएं।"
                    ),
                    CertificationStepItem(
                        step_number=3,
                        title="विनिर्माण सुविधा कारखाना लेखापरीक्षा",
                        description="बीआईएस विशेषज्ञ उत्पादन क्षमता, आंतरिक परीक्षण बुनियादी ढांचे और गुणवत्ता नियंत्रण प्रणालियों का ऑन-साइट ऑडिट करते हैं।"
                    ),
                    CertificationStepItem(
                        step_number=4,
                        title="स्कीम-X लाइसेंस और निरंतर तकनीकी निगरानी",
                        description="सफल तकनीकी और परीक्षण अनुपालन पर स्कीम-X मानक चिह्न का उपयोग करने के लिए लाइसेंस प्रदान किया जाता है।"
                    )
                ]
                req_docs = [
                    "मान्यता प्राप्त प्रयोगशाला से व्यापक टाइप टेस्ट रिपोर्ट",
                    "तकनीकी निर्माण फाइल, इंजीनियरिंग आरेख और सुरक्षा जोखिम विश्लेषण",
                    "घटक विनिर्देशों के साथ सामग्री का बिल (BOM)",
                    "कारखाना गुणवत्ता नियंत्रण मैनुअल"
                ]
                important_notes = [
                    "स्कीम-X प्रतिनिधि टाइप-परीक्षण के माध्यम से जटिल उपकरण परिवारों के प्रमाणन की अनुमति देता है।",
                    "कारखाना लेखापरीक्षा उत्पाद सुरक्षा और उत्पादन लाइन परीक्षण बुनियादी ढांचे दोनों का मूल्यांकन करती है।"
                ]
            else:
                scheme_name = "Scheme X — Industrial Equipment Certification"
                summary = f"BIS Scheme-X Comprehensive Certification process for industrial machinery, transformers, and switchgear ('{product}')."
                applicability = "Applies to Indian and Foreign manufacturers of low-voltage switchgear and controlgear, industrial machinery, electrical transformers, and complex rotating equipment."
                applicable_prods = [
                    "Low-Voltage Switchgear & Controlgear Assemblies",
                    "Industrial Machinery, Machine Tools & Plant Equipment",
                    "Power & Distribution Transformers",
                    "Rotating Electrical Machines & Industrial Drives"
                ]
                testing_info = "Comprehensive prototype type-testing at BIS recognized laboratories, combined with rigorous technical evaluation of engineering construction files and on-site factory audit."
                steps = [
                    CertificationStepItem(
                        step_number=1,
                        title="Technical Construction File & Design Dossier",
                        description=f"Compile technical engineering file for '{product}', including circuit schematics, component Bill of Materials (BOM), and safety risk assessment."
                    ),
                    CertificationStepItem(
                        step_number=2,
                        title="Prototype Comprehensive Type-Testing",
                        description="Execute mandatory type tests on representative product prototypes at a BIS-recognized or accredited laboratory against applicable Indian Standards."
                    ),
                    CertificationStepItem(
                        step_number=3,
                        title="Manufacturing Facility On-Site Audit",
                        description="BIS technical experts inspect the manufacturing premises to evaluate production capabilities, routine testing setups, and quality control systems."
                    ),
                    CertificationStepItem(
                        step_number=4,
                        title="Grant of Scheme-X License & Surveillance",
                        description="Upon satisfactory technical file review, test reports, and audit findings, BIS issues the Scheme-X License with ongoing surveillance."
                    )
                ]
                req_docs = [
                    "Comprehensive Type-Test Reports from BIS recognized/accredited test lab",
                    "Technical Construction File (TCF) with design drawings and safety analyses",
                    "Bill of Materials (BOM) specifying certified sub-components",
                    "In-house routine testing and quality assurance manuals"
                ]
                important_notes = [
                    "Scheme X allows certification of entire industrial product families based on representative type examination.",
                    "Surveillance audits evaluate both manufacturing quality systems and continued conformance of series production."
                ]

        # 5. FMCS (Foreign Manufacturers Certification Scheme — Scheme I)
        elif "fmcs" in lower_scheme or "foreign" in lower_scheme:
            if is_hi:
                scheme_name = "विदेशी निर्माता प्रमाणन योजना (FMCS — स्कीम-I)"
                summary = f"भारत के बाहर स्थित विदेशी निर्माताओं ('{product}') के लिए बीआईएस FMCS प्रक्रिया।"
                applicability = "भारत के बाहर स्थित विदेशी विनिर्माण इकाइयों पर लागू होता है जो भारत में उत्पाद निर्यात करने के लिए आईएसआई मार्क प्राप्त करना चाहते हैं।"
                applicable_prods = [
                    "अनिवार्य गुणवत्ता नियंत्रण आदेशों (QCO) के तहत अधिसूचित सभी उत्पाद",
                    "विदेशी निर्माताओं द्वारा स्वैच्छिक आईएसआई मार्क आवेदन"
                ]
                testing_info = "विदेश में विनिर्माण परिसर का बीआईएस तकनीकी अधिकारियों द्वारा ऑन-साइट ऑडिट + भारतीय प्रयोगशालाओं में नमूनों का स्वतंत्र परीक्षण।"
                steps = [
                    CertificationStepItem(
                        step_number=1,
                        title="अधिकृत भारतीय प्रतिनिधि (AIR) का नामांकन",
                        description="भारत में निवासी या भारत में पंजीकृत कंपनी को कानूनी रूप से जवाबदेह अधिकृत भारतीय प्रतिनिधि (AIR) के रूप में नियुक्त करें।"
                    ),
                    CertificationStepItem(
                        step_number=2,
                        title="Manakonline पर ऑनलाइन आवेदन",
                        description="विदेशी कारखाना प्रोफाइल, मशीनरी, परीक्षण उपकरण और AIR विवरण के साथ ऑनलाइन आवेदन प्रस्तुत करें।"
                    ),
                    CertificationStepItem(
                        step_number=3,
                        title="विदेशी कारखाने का बीआईएस अधिकारियों द्वारा ऑन-साइट निरीक्षण",
                        description="बीआईएस तकनीकी अधिकारी विदेश स्थित विनिर्माण परिसर का दौरा कर बुनियादी ढांचे और परीक्षण सुविधाओं का सत्यापन करते हैं और नमूने लेते हैं।"
                    ),
                    CertificationStepItem(
                        step_number=4,
                        title="भारत में स्वतंत्र प्रयोगशाला परीक्षण",
                        description="विदेश में लिए गए सत्यापन नमूनों को परीक्षण के लिए भारत में बीआईएस अनुमोदित प्रयोगशालाओं में भेजा जाता है।"
                    ),
                    CertificationStepItem(
                        step_number=5,
                        title="परफॉर्मेंस बैंक गारंटी (PBG) और लाइसेंस अनुदान",
                        description="परीक्षण पास होने पर, निर्धारित PBG और शुल्क जमा करने के बाद CM/L लाइसेंस प्रदान किया जाता है।"
                    )
                ]
                req_docs = [
                    "अधिकृत भारतीय प्रतिनिधि (AIR) नामांकन दस्तावेज",
                    "AIR का भारतीय निवास और कंपनी निगमन प्रमाण",
                    "विनिर्माण मशीनरी सूची और कारखाना लेआउट योजना",
                    "अंशांकन प्रमाणपत्रों के साथ परीक्षण उपकरण सूची",
                    "मान्यता प्राप्त भारतीय बैंक से परफॉर्मेंस बैंक गारंटी (PBG)"
                ]
                important_notes = [
                    "AIR बीआईएस अधिनियम, 2016 के तहत कानूनी रूप से जिम्मेदार होता है।",
                    "बीआईएस अधिकारियों के विदेश यात्रा और निरीक्षण के सभी खर्च विदेशी निर्माता द्वारा वहन किए जाते हैं।"
                ]
            else:
                scheme_name = "Foreign Manufacturers Certification Scheme (FMCS — Scheme I)"
                summary = f"BIS FMCS licensing procedure under Scheme-I for foreign manufacturers exporting '{product}' to India."
                applicability = "Operates under Scheme-I for manufacturing premises located outside India seeking to use the Standard Mark (ISI Mark) on exports to India."
                applicable_prods = [
                    "All products notified under compulsory Indian Quality Control Orders (QCOs)",
                    "Voluntary ISI mark applications from overseas manufacturing plants"
                ]
                testing_info = "Physical on-site factory audit at the overseas plant by BIS technical officers + independent verification sample testing in Indian recognized laboratories."
                steps = [
                    CertificationStepItem(
                        step_number=1,
                        title="Nomination of Authorized Indian Representative (AIR)",
                        description="Appoint an Authorized Indian Representative (AIR) resident in India who assumes legal liability under the BIS Act, 2016."
                    ),
                    CertificationStepItem(
                        step_number=2,
                        title="Online Application Submission via Manakonline",
                        description=f"Submit online application for '{product}' detailing manufacturing infrastructure, test equipment, and AIR credentials."
                    ),
                    CertificationStepItem(
                        step_number=3,
                        title="On-Site Overseas Factory Audit by BIS",
                        description="BIS technical officers travel to the overseas manufacturing premises to inspect production, evaluate quality systems, and draw verification samples."
                    ),
                    CertificationStepItem(
                        step_number=4,
                        title="Independent Laboratory Testing in India",
                        description="Verification samples drawn during the overseas inspection are shipped to India and tested in BIS-recognized laboratories."
                    ),
                    CertificationStepItem(
                        step_number=5,
                        title="Submission of PBG & Grant of CM/L License",
                        description="Upon passing test results, submit a Performance Bank Guarantee (PBG) and marking fees to receive the CM/L certification licence."
                    )
                ]
                req_docs = [
                    "Nomination of Authorized Indian Representative (AIR) on non-judicial stamp paper",
                    "AIR identity, residency, and incorporation proofs in India",
                    "Manufacturing machinery list and process flow chart",
                    "In-house testing equipment with valid calibration certificates",
                    "Performance Bank Guarantee (PBG) from an approved Indian bank"
                ]
                important_notes = [
                    "The AIR must be an Indian resident or entity registered in India and is legally liable for non-compliance under the BIS Act, 2016.",
                    "Inspection expenses for BIS officers traveling abroad are borne entirely by the foreign manufacturer."
                ]

        # 6. Default / Scheme I (Product Certification Scheme — ISI Mark)
        else:
            if is_hi:
                scheme_name = "स्कीम-I — उत्पाद प्रमाणन योजना (ISI मार्क)"
                summary = f"घरेलू विनिर्माताओं के लिए उत्पाद '{product}' पर मानक चिह्न (ISI मार्क) प्राप्त करने की बीआईएस स्कीम-I प्रक्रिया।"
                applicability = "घरेलू निर्माताओं के लिए लागू भारतीय मानकों या अनिवार्य गुणवत्ता नियंत्रण आदेशों (QCO) के तहत मानक उत्पाद प्रमाणन।"
                applicable_prods = [
                    "घरेलू प्रेशर कुकर (IS 2347:2023)",
                    "पैकेजबंद पेयजल (IS 14543:2024)",
                    "खिलौनों की सुरक्षा (IS 9873:2012)",
                    "घरेलू विद्युत उपकरण (IS 302:2024)",
                    "साधारण पोर्टलैंड सीमेंट (IS 269:2015)",
                    "TMT स्टील बार्स (IS 1786:2008)",
                    "पीवीसी इंसुलेटेड केबल (IS 694:2010)",
                    "प्लग और सॉकेट (IS 1293:2019)"
                ]
                testing_info = "कारखाना में आवश्यक परीक्षण उपकरण (SIT के अनुसार) + बीआईएस अधिकारी द्वारा कारखाना निरीक्षण + बीआईएस मान्यता प्राप्त प्रयोगशाला में स्वतंत्र परीक्षण।"
                steps = [
                    CertificationStepItem(
                        step_number=1,
                        title="लागू मानक और SIT की पहचान",
                        description=f"उत्पाद '{product}' के लिए लागू भारतीय मानक विनिर्देश और निरीक्षण एवं परीक्षण योजना (SIT) की पुष्टि करें।"
                    ),
                    CertificationStepItem(
                        step_number=2,
                        title="इन-हाउस प्रयोगशाला और गुणवत्ता नियंत्रण बुनियादी ढांचा",
                        description="विनिर्माण परिसर में पूर्ण इन-हाउस परीक्षण उपकरण स्थापित करें और योग्य तकनीकी गुणवत्ता नियंत्रण कर्मियों की नियुक्ति करें।"
                    ),
                    CertificationStepItem(
                        step_number=3,
                        title="Manakonline पोर्टल पर ऑनलाइन आवेदन",
                        description="आधिकारिक बीआईएस पोर्टल (www.manakonline.in) पर कारखाना लेआउट, मशीनरी सूची और SIT स्वीकृति के साथ आवेदन जमा करें।"
                    ),
                    CertificationStepItem(
                        step_number=4,
                        title="कारखाना निरीक्षण और नमूना आहरण",
                        description="बीआईएस अधिकारी विनिर्माण स्थल का निरीक्षण करते हैं और स्वतंत्र परीक्षण के लिए आधिकारिक सत्यापन नमूने एकत्र करते हैं।"
                    ),
                    CertificationStepItem(
                        step_number=5,
                        title="लाइसेंस अनुदान (CM/L)",
                        description="प्रयोगशाला परीक्षण रिपोर्ट सफल आने और निरीक्षण अनुपालन पर ISI मार्क का उपयोग करने के लिए लाइसेंस प्रदान किया जाता है।"
                    )
                ]
                req_docs = [
                    "कारखाना पंजीकरण / उद्यम प्रमाणपत्र (MSME)",
                    "विनिर्माण मशीनरी की विस्तृत सूची और प्रक्रिया प्रवाह चार्ट",
                    "वैध अंशांकन प्रमाणपत्रों के साथ इन-हाउस परीक्षण उपकरण सूची",
                    "निरीक्षण एवं परीक्षण योजना (SIT) की स्वीकृति",
                    "योग्य तकनीकी गुणवत्ता नियंत्रण कर्मियों की नियुक्ति पत्र"
                ]
                important_notes = [
                    "पूर्व-परीक्षण रिपोर्ट वाले चुनिंदा उत्पादों के लिए सरलीकृत प्रक्रिया (Simplified Procedure) भी उपलब्ध है।",
                    "लाइसेंस प्राप्त निर्माताओं को नियमित बैच परीक्षण रिकॉर्ड बनाए रखना होता है और आवधिक औचक निगरानी का सामना करना होता है।"
                ]
            else:
                scheme_name = "Scheme I — Product Certification (ISI Mark Scheme)"
                summary = f"BIS Scheme-I Product Certification pathway for '{product}' to obtain the Standard Mark (ISI Mark)."
                applicability = "Standard product certification scheme for domestic manufacturers covering products under voluntary Indian Standards or mandatory Quality Control Orders (QCOs)."
                applicable_prods = [
                    "Domestic Pressure Cookers (IS 2347:2023)",
                    "Packaged Drinking Water (IS 14543:2024)",
                    "Safety of Toys (IS 9873 Part 1:2012)",
                    "Household Electrical Appliances (IS 302 Part 1:2024)",
                    "Ordinary Portland Cement (IS 269:2015)",
                    "High Strength Deformed Steel Bars - TMT (IS 1786:2008)",
                    "PVC Insulated Cables (IS 694:2010)",
                    "Plugs and Socket-Outlets (IS 1293:2019)"
                ]
                testing_info = "Manufacturing premises must have complete in-house testing equipment as per Scheme of Inspection and Testing (SIT). Preliminary factory inspection by BIS auditor + independent sample testing in a BIS-recognized laboratory."
                steps = [
                    CertificationStepItem(
                        step_number=1,
                        title="Identify Applicable Standard & Scheme of Testing (SIT)",
                        description=f"Confirm the applicable Indian Standard specification and prescribed Scheme of Inspection and Testing (SIT) for '{product}'."
                    ),
                    CertificationStepItem(
                        step_number=2,
                        title="In-House Testing Setup & Quality Personnel",
                        description="Establish complete in-house laboratory facilities with calibrated testing instruments and employ qualified quality control personnel."
                    ),
                    CertificationStepItem(
                        step_number=3,
                        title="Digital Application via Manakonline",
                        description="Submit the formal application on www.manakonline.in along with factory layout, machinery list, and test capability declaration."
                    ),
                    CertificationStepItem(
                        step_number=4,
                        title="Factory Audit & Sample Drawing",
                        description="A BIS technical officer inspects the manufacturing premises, verifies in-house testing, and draws samples for independent lab testing."
                    ),
                    CertificationStepItem(
                        step_number=5,
                        title="Grant of Certification Mark License (CM/L)",
                        description="Upon receiving passing test reports from the recognized laboratory, BIS grants the CM/L license to apply the ISI Mark."
                    )
                ]
                req_docs = [
                    "Factory registration / MSME / Udhyam Certificate",
                    "Manufacturing machinery list and process flow chart",
                    "Complete in-house testing equipment list with valid calibration certificates",
                    "Acceptance of Scheme of Inspection and Testing (SIT)",
                    "Appointment letter of qualified technical QC personnel"
                ]
                important_notes = [
                    "Simplified procedure is available for select products where pre-tested laboratory reports can be submitted with the application.",
                    "Licensees must maintain routine batch testing registers and undergo periodic unannounced factory surveillance."
                ]

        return CertificationGuidanceResponse(
            product=product,
            scheme_name=scheme_name,
            summary=summary,
            applicability=applicability,
            applicable_products_or_standards=applicable_prods,
            steps=steps,
            required_documents=req_docs,
            testing_and_assessment=testing_info,
            important_notes=important_notes,
            sources=citations,
            retrieval_summary=evidence_summary,
            disclaimer=(
                "यह मार्गदर्शन आधिकारिक बीआईएस सार्वजनिक जानकारी पर आधारित है। वैधानिक आवश्यकताओं की पुष्टि मनकऑनलाइन पोर्टल पर करें।"
                if is_hi else
                "This guidance reflects official BIS documentation and Conformity Assessment Regulations. Statutory fees and criteria should be confirmed on the official Manakonline portal."
            ),
            is_demo=has_demo,
            demo_badge=settings.DEMO_DATA_NOTICE if has_demo else None
        )


certification_service = CertificationService()
