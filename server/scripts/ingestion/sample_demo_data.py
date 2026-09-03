"""
Sample Demo Data for Architecture and UI Verification.

CRITICAL NOTICE:
All records below are explicitly marked as "Demo / Sample / Not official".
These sample items are used solely for end-to-end software verification,
unit testing, and UI rendering before authorized BIS source datasets
are ingested.
"""

DEMO_NOTICE = "Demo / Sample / Not official"

DEMO_STANDARDS = [
    {
        "code": "IS 2347",
        "title": "Domestic Pressure Cookers — Specification",
        "category": "Mechanical / Consumer Goods",
        "reason": "Covers safety and performance requirements for domestic pressure cookers.",
        "status": "Active",
        "is_demo": True,
        "demo_badge": DEMO_NOTICE,
        "source_url": "https://www.bis.gov.in (Official portal reference)",
        "source_doc": "Indian Standard Specification IS 2347 (Demo Reference)",
        "section": "Clause 4 - Safety Requirements",
        "page_number": 8
    },
    {
        "code": "IS 9873 (Part 1)",
        "title": "Safety of Toys — Part 1: Mechanical and Physical Properties",
        "category": "Toys & Children Products",
        "reason": "Essential safety specifications against physical and mechanical hazards in toys.",
        "status": "Active",
        "is_demo": True,
        "demo_badge": DEMO_NOTICE,
        "source_url": "https://www.bis.gov.in (Official portal reference)",
        "source_doc": "Indian Standard IS 9873 (Demo Reference)",
        "section": "Section 4.1 - Physical Characteristics",
        "page_number": 14
    },
    {
        "code": "IS 14543",
        "title": "Packaged Drinking Water (Other than Packaged Natural Mineral Water)",
        "category": "Food & Agriculture",
        "reason": "Mandatory certification standard for packaged drinking water manufacturing in India.",
        "status": "Active",
        "is_demo": True,
        "demo_badge": DEMO_NOTICE,
        "source_url": "https://www.bis.gov.in (Official portal reference)",
        "source_doc": "Indian Standard IS 14543 (Demo Reference)",
        "section": "Clause 3 - Hygienic and Microbial Standards",
        "page_number": 6
    },
    {
        "code": "IS 1293",
        "title": "Plugs and Socket-Outlets of Rated Voltage up to and including 250 Volts",
        "category": "Electrotechnical",
        "reason": "Specification for plugs and socket-outlets for household and similar purposes.",
        "status": "Active",
        "is_demo": True,
        "demo_badge": DEMO_NOTICE,
        "source_url": "https://www.bis.gov.in (Official portal reference)",
        "source_doc": "Indian Standard IS 1293 (Demo Reference)",
        "section": "Clause 5 - Electrical Safety & Insulation",
        "page_number": 11
    }
]

DEMO_LABORATORIES = [
    {
        "name": "Central Laboratory, Sahibabad (Sample Record)",
        "location": "Ghaziabad / Delhi NCR",
        "state": "Uttar Pradesh",
        "categories": ["Mechanical", "Electrical", "Chemical"],
        "scope_of_testing": "Pressure cookers, electrical appliances, domestic cables",
        "recognition_status": "BIS In-House Central Laboratory (Sample Record)",
        "source_url": "https://www.bis.gov.in",
        "is_demo": True,
        "demo_badge": DEMO_NOTICE
    },
    {
        "name": "Western Regional Office Laboratory (Sample Record)",
        "location": "Mumbai",
        "state": "Maharashtra",
        "categories": ["Chemical", "Mechanical", "Food & Water"],
        "scope_of_testing": "Packaged drinking water, plastics, mechanical products",
        "recognition_status": "BIS Regional Laboratory (Sample Record)",
        "source_url": "https://www.bis.gov.in",
        "is_demo": True,
        "demo_badge": DEMO_NOTICE
    },
    {
        "name": "Southern Regional Office Laboratory (Sample Record)",
        "location": "Chennai",
        "state": "Tamil Nadu",
        "categories": ["Electrical", "Electronics", "Mechanical"],
        "scope_of_testing": "IT goods, electronics safety, plugs & sockets",
        "recognition_status": "BIS Regional Laboratory (Sample Record)",
        "source_url": "https://www.bis.gov.in",
        "is_demo": True,
        "demo_badge": DEMO_NOTICE
    }
]

DEMO_CERTIFICATION_SCHEMES = {
    "isi": {
        "scheme_name": "Scheme I — ISI Mark Certification Scheme",
        "description": "Product certification scheme for manufacturing units certifying conformance to Indian Standards.",
        "applicability": "Applies to domestic manufacturers across mandatory and voluntary product categories.",
        "key_features": [
            "Factory inspection and in-house laboratory audit",
            "Independent testing of samples at BIS or recognized laboratories",
            "Grant of license to use the ISI mark",
            "Periodic surveillance audits"
        ],
        "sources": [
            {
                "document_title": "BIS Conformity Assessment Regulations (Demo Reference)",
                "section": "Scheme I (Marking Fee & Licensing)",
                "page_number": 4,
                "url": "https://www.manakonline.in",
                "is_demo": True,
                "demo_badge": DEMO_NOTICE
            }
        ]
    },
    "crs": {
        "scheme_name": "Scheme II — Compulsory Registration Scheme (CRS)",
        "description": "Self-declaration of conformity based on test reports from BIS-recognized labs for designated IT and electronics.",
        "applicability": "Applies to electronic goods, solar equipment, and IT devices notified under MeitY orders.",
        "key_features": [
            "Testing in BIS recognized laboratory in India",
            "Submission of test report online via Manakonline",
            "No prior factory inspection required for registration",
            "Use of Standard Mark with Registration Number"
        ],
        "sources": [
            {
                "document_title": "BIS Compulsory Registration Scheme Guidelines (Demo Reference)",
                "section": "CRS Application Overview",
                "page_number": 2,
                "url": "https://www.crsbis.in",
                "is_demo": True,
                "demo_badge": DEMO_NOTICE
            }
        ]
    }
}
