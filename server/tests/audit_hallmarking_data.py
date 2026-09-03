import sys
sys.path.insert(0, '.')
from app.db.supabase import get_supabase_client

sb = get_supabase_client()

docs = sb.table('knowledge_documents').select('*').execute().data
print('Total knowledge_documents in Supabase:', len(docs))
for d in docs:
    print(' - ID:', d.get('id'), '| Title:', d.get('title'), '| URL:', d.get('source_url'))

chunks = sb.table('knowledge_chunks').select('id, document_id, section, page_number, chunk_text').execute().data
print('\nTotal knowledge_chunks in Supabase:', len(chunks))

hm_chunks = [c for c in chunks if any(k in c.get('chunk_text', '').lower() for k in ['hallmark', 'huid', 'silver', 'gold'])]
print('\nHallmarking related chunks count:', len(hm_chunks))
for idx, c in enumerate(hm_chunks):
    print('\n--- Chunk', idx + 1, '[Section:', c.get('section'), '] ---')
    print(c.get('chunk_text'))

silver_chunks = [c for c in hm_chunks if 'silver' in c.get('chunk_text', '').lower()]
print('\nChunks mentioning Silver:', len(silver_chunks))
for sc in silver_chunks:
    print(sc.get('chunk_text'))