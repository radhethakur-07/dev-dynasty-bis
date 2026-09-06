# Dev Dynasty — BIS Intelligence Assistant (SIH267107)

> **Smart India Hackathon** | Problem Statement: **SIH267107**  
> AI-Powered Intelligent Assistant for Indian Standards and Bureau of Indian Standards (BIS) Services.

---

## 🏛️ Project Overview
The **BIS Intelligence Assistant** is a purpose-built, source-grounded platform designed to assist MSMEs, startups, manufacturers, researchers, and consumers in navigating the vast regulatory ecosystem of the Bureau of Indian Standards (BIS).

Instead of functioning as an open-ended generic chatbot, the assistant enforces:
1. **Pydantic Validation**: Strict backend type verification on every input and output.
2. **Controlled Function Calling**: The LLM selects domain-specific allowlisted tools; arbitrary SQL or database queries are strictly prohibited.
3. **Evidence-Grounded RAG**: Answers are synthesized from retrieved knowledge chunks stored in Supabase with pgvector.
4. **Transparent Citations**: Every answer includes document title, section, page number, and source URL where available.
5. **No Hallucination Policy**: If verified evidence is absent, the system explicitly states insufficient information.
6. **Bilingual Support**: Full conversational workflows in English and Hindi while preserving official Indian Standard designations (`IS XXXX`).

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: Next.js 14/15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Python 3.11, FastAPI, Pydantic v2, Pydantic Settings
- **AI / LLM**: Gemini API (Structured Outputs & Function Calling)
- **Database & Vector Store**: Supabase PostgreSQL + pgvector
- **Deployment Targets**: Vercel (Frontend), Render (Backend), Supabase (Database & Vectors)

---

## 📁 Repository Structure
```
dev-dynasty-bis/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/            # App Router pages (Landing, Assistant, Finder, Cert, etc.)
│   │   ├── components/     # Dynamic response components, Chat UI, Navigation
│   │   ├── lib/            # Typed API client SDK
│   │   └── types/          # Shared TypeScript contracts matching backend Pydantic
├── server/                 # FastAPI backend application
│   ├── app/
│   │   ├── ai/             # Gemini provider abstraction, prompts, and orchestrator
│   │   ├── api/v1/         # REST API endpoints (/chat, /standards, /health, etc.)
│   │   ├── core/           # Config (Pydantic Settings), logging, middleware
│   │   ├── db/             # Supabase client and pgvector queries
│   │   ├── repositories/   # Data access layer
│   │   ├── schemas/        # Pydantic schemas (Intents, Tools, Responses)
│   │   ├── services/       # Standards, Certification, Hallmarking, RAG services
│   │   └── tools/          # Allowlisted backend tools
│   ├── scripts/
│   │   └── ingestion/      # Separate document ingestion & vector indexing pipeline
│   ├── tests/              # Pytest test suite
│   └── requirements.txt
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+ (Node.js 24 LTS installed)
- Supabase account (or local demo mode)
- Google Gemini API key

### 1. Backend Setup
```bash
cd server
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
cp ../.env.example .env
# Edit .env with your credentials

uvicorn app.main:app --reload --port 8000
```
Backend health check: `http://localhost:8000/api/health`

### 2. Frontend Setup
```bash
cd client
npm install
cp ../.env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔒 Security & Guardrails
- **Zero Arbitrary Execution**: Neither the user nor the LLM can trigger raw database execution.
- **Strict Allowlist**: Only predefined tools (`search_bis_standards`, `get_certification_guidance`, `get_scheme_information`, `search_hallmarking_info`, `find_testing_labs`, `search_bis_knowledge`) can be called.
- **Isolated Ingestion**: The data ingestion pipeline is decoupled from runtime chat.
- **JWT Authentication**: All chat and session endpoints are protected with JWT tokens.
- **Sample Data Transparency**: Any non-official seed data is flagged as `"Demo / Sample / Not official"`.

---

## 🔑 Authentication
The system uses email-based authentication with JWT tokens.

### Demo Credentials
- **Email**: `demo@devdynasty.bis`
- **Password**: `BISDemo2024!`

### Email Verification (Brevo)
Set `BREVO_API_KEY` in your `.env` to enable email verification. Without it, the system works in demo mode (OTP shown in server logs).

---

## 🚀 Deployment

### Backend → Render
1. Push code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Root directory: `server`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Set environment variables: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `CLIENT_URL`

### Frontend → Vercel
1. Import the GitHub repo on [Vercel](https://vercel.com)
2. Root directory: `client`
3. Framework: Next.js (auto-detected)
4. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`

### Database Setup
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard)
2. Run `server/scripts/ingestion/schema.sql` to create all tables
3. Run `server/scripts/ingestion/setup_users_table.sql` to create the users table

---

## 📊 Data Counts
| Data | Count |
|------|-------|
| Standards | 753 |
| Laboratories | 437 |
| Knowledge Documents | 28 |
| Knowledge Chunks (embedded) | 378 |
| Embedding Model | gemini-embedding-001 (768-dim) |

---

## 📜 Team Dev Dynasty
Built for **Smart India Hackathon (SIH267107)**.
