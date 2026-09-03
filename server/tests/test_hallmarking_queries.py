import sys
sys.path.insert(0, '.')
from app.services.rag_service import rag_service
from app.tools.registry import tool_registry

queries = [
    'Gold jewellery hallmark',
    'Silver jewellery hallmark',
    'HUID verification',
    'hallmark lookup guidelines',
    'consumer verification of hallmarked jewellery'
]

print('=' * 80)
print('HALLMARKING RAG & RETRIEVAL AUDIT TEST')
print('=' * 80)

for idx, q in enumerate(queries, 1):
    print('\n--- TEST', idx, ':', q, '---')
    
    # 1. Direct pgvector vector retrieval
    chunks = rag_service.retrieve_context(q, match_count=4)
    print('1. pgvector Retrieved Chunks Count:', len(chunks))
    if chunks:
        for c_idx, c in enumerate(chunks, 1):
            sim = c.get('similarity', 'N/A')
            doc = c.get('document_title', c.get('document_id', 'Unknown'))
            sec = c.get('section', 'N/A')
            text = c.get('chunk_text', '')[:180].replace('\n', ' ')
            print('   Chunk', c_idx, ':', f'[Similarity: {sim}] Doc:', doc, '| Sec:', sec)
            print('     Excerpt:', text + '...')
    else:
        print('   No chunks returned from pgvector.')

    # 2. Tool execution via search_hallmarking_info
    tool_res = tool_registry.execute_tool('search_hallmarking_info', {'query': q, 'language': 'en'})
    res_dict = tool_res.model_dump() if hasattr(tool_res, 'model_dump') else dict(tool_res)
    t_type = res_dict.get('type')
    metal = res_dict.get('precious_metal')
    summ = res_dict.get('summary')
    purity = res_dict.get('purity_grades')
    marks = res_dict.get('mandatory_marks')
    src_cnt = len(res_dict.get('sources', []))
    print('2. Tool Result (search_hallmarking_info):')
    print('   Type:', t_type)
    print('   Precious Metal:', metal)
    print('   Summary:', summ)
    print('   Purity Grades:', purity)
    print('   Mandatory Marks:', marks)
    print('   Sources Count:', src_cnt)

print('\n' + '=' * 80)