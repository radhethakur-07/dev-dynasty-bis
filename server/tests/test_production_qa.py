import sys
sys.path.insert(0, '.')
from app.services.rag_service import rag_service
from app.tools.registry import tool_registry
from app.repositories.standards_repo import standards_repo
from app.services.laboratory_service import laboratory_service

qa_tests = [
    ('pressure cooker', 'standards'),
    ('packaged drinking water', 'standards'),
    ('toys', 'standards'),
    ('electrical appliance', 'standards'),
    ('gold hallmark', 'hallmarking'),
    ('silver hallmark', 'hallmarking'),
    ('HUID verification', 'hallmarking'),
    ('certification requirements', 'certification'),
    ('recognized testing laboratory', 'laboratories')
]

print('=' * 80)
print('PRODUCTION RETRIEVAL QA PASS (9 MANDATORY TARGETS)')
print('=' * 80)

for idx, (query, q_type) in enumerate(qa_tests, 1):
    print('\n[QA', idx, '] Query:', query, '(Type:', q_type, ')')
    
    if q_type == 'standards':
        results = standards_repo.search_standards(query=query, product=query)
        top = results[0] if results else {}
        code = top.get('code', 'None')
        score = top.get('relevance_score', 0.0)
        title = top.get('title', 'None')
        src = top.get('source_url', 'None')
        print(' - Tool: search_bis_standards')
        print(' - Standards Matched Count:', len(results))
        print(' - Top Standard:', code, f'({title})')
        print(f' - Match Score: {score:.2f}')
        print(' - Official Source URL:', src)
        print(' - Grounded in BIS Knowledge:', len(results) > 0 and score >= 0.60)

    elif q_type == 'hallmarking':
        res = tool_registry.execute_tool('search_hallmarking_info', {'query': query, 'language': 'en'})
        res_dict = res.model_dump() if hasattr(res, 'model_dump') else dict(res)
        chunks = rag_service.retrieve_context(query, match_count=3)
        top_chunk = chunks[0] if chunks else {}
        top_doc = top_chunk.get('document_title', 'Unknown')
        top_sim = top_chunk.get('similarity', 0.0)
        sec = top_chunk.get('section', 'General')
        
        print(' - Tool: search_hallmarking_info')
        print(' - pgvector Chunks Retrieved:', len(chunks))
        print(' - Top Document:', top_doc, f'(Section: {sec})')
        print(f' - Vector Similarity: {top_sim:.4f}')
        print(' - Metal Handled:', res_dict.get('precious_metal'))
        print(' - Purity Grades Count:', len(res_dict.get('purity_grades', [])))
        print(' - Mandatory Marks Count:', len(res_dict.get('mandatory_marks', [])))
        print(' - Grounded in BIS Knowledge:', len(chunks) > 0 and top_sim > 0.60)

    elif q_type == 'certification':
        chunks = rag_service.retrieve_context(query, match_count=3)
        top_chunk = chunks[0] if chunks else {}
        top_doc = top_chunk.get('document_title', 'Unknown')
        top_sim = top_chunk.get('similarity', 0.0)
        sec = top_chunk.get('section', 'General')
        res = tool_registry.execute_tool('get_certification_guidance', {'product': 'Domestic Product', 'scheme': 'Scheme I', 'language': 'en'})
        res_dict = res.model_dump() if hasattr(res, 'model_dump') else dict(res)
        
        print(' - Tool: get_certification_guidance')
        print(' - pgvector Chunks Retrieved:', len(chunks))
        print(' - Top Document:', top_doc, f'(Section: {sec})')
        print(f' - Vector Similarity: {top_sim:.4f}')
        print(' - Guidance Steps Count:', len(res_dict.get('steps', [])))
        print(' - Grounded in BIS Knowledge:', len(chunks) > 0 and top_sim > 0.60)

    elif q_type == 'laboratories':
        labs_resp = laboratory_service.find_labs(product_or_test='cement electrical appliances testing')
        labs = labs_resp.laboratories
        print(' - Tool: find_testing_labs')
        print(' - Recognized Laboratories Count:', len(labs))
        top_lab = labs[0] if labs else None
        if top_lab:
            print(' - Top Lab:', top_lab.name, f'({top_lab.location})', '- Status:', top_lab.recognition_status)
            print(' - Scope:', top_lab.scope_or_capabilities)
            print(' - Official Source:', top_lab.source_url)
        print(' - Grounded in BIS Knowledge:', len(labs) > 0)

print('\n' + '=' * 80)