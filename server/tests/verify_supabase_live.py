from app.services.rag_service import rag_service
from app.tools.registry import tool_registry
from app.db.supabase import get_supabase_client

client = get_supabase_client()
print("=== LIVE SUPABASE STATUS ===")
print("Client initialized:", client is not None)

# Check counts in Supabase
stds_cnt = client.table("standards_metadata").select("count", count="exact").execute().count
docs_cnt = client.table("knowledge_documents").select("count", count="exact").execute().count
chunks_cnt = client.table("knowledge_chunks").select("count", count="exact").execute().count
labs_cnt = client.table("laboratories").select("count", count="exact").execute().count

print(f"Supabase Standards Count: {stds_cnt}")
print(f"Supabase Documents Count: {docs_cnt}")
print(f"Supabase Vector Chunks Count: {chunks_cnt}")
print(f"Supabase Laboratories Count: {labs_cnt}")

print("\n=== LIVE PGVECTOR SIMILARITY SEARCH ===")
chunks = rag_service.retrieve_context("HUID hallmarking gold verification", match_count=3)
print(f"Retrieved {len(chunks)} chunks via pgvector similarity search:")
for i, c in enumerate(chunks, 1):
    print(f"  {i}. Title: {c.get('document_title')} | Section: {c.get('section')} | Similarity: {c.get('similarity')} | Source: {c.get('source_url')}")

print("\n=== LIVE BIS TOOLS READING FROM SUPABASE ===")
# 1. Standards tool
r_std = tool_registry.execute_tool("search_bis_standards", {"product": "pressure cooker", "query": "pressure cooker standard"})
print("1. search_bis_standards:")
print(f"   Code: {r_std.standards[0].code} | Title: {r_std.standards[0].title}")
print(f"   is_demo: {r_std.is_demo} | Citation: {r_std.sources[0].url}")

# 2. Laboratories tool
r_lab = tool_registry.execute_tool("find_testing_labs", {"product_or_test": "food testing", "location": "Noida"})
print("2. find_testing_labs:")
print(f"   Lab: {r_lab.laboratories[0].name} | Location: {r_lab.laboratories[0].location}")
print(f"   is_demo: {r_lab.is_demo} | Citation: {r_lab.sources[0].url}")

# 3. Hallmarking tool
r_hall = tool_registry.execute_tool("search_hallmarking_info", {"query": "HUID verification"})
print("3. search_hallmarking_info:")
print(f"   Summary: {r_hall.summary[:80]}...")
print(f"   is_demo: {r_hall.is_demo} | Citation: {r_hall.sources[0].url}")

# 4. Knowledge tool (RAG)
r_know = tool_registry.execute_tool("search_bis_knowledge", {"query": "Scheme-I ISI mark product certification process"})
print("4. search_bis_knowledge:")
print(f"   Sources retrieved: {len(r_know.sources)}")
print(f"   is_demo: {r_know.is_demo} | Top Citation: {r_know.sources[0].url}")

print("\n=== VERIFICATION COMPLETE ===")
