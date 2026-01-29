# External Integrations

**Analysis Date:** 2026-01-29

## APIs & External Services

**OpenAI:**
- GPT-4o-mini - Primary LLM for all agent operations
  - SDK/Client: `openai>=1.109.1`, `langchain-openai>=1.0.1`
  - Auth: `OPENAI_API_KEY` env var
  - Usage: Chat responses, query enhancement, reranking, question generation
  - Implementation: `src/agents/chat_agent/agent.py`, `src/agents/query_enhancer/agent.py`, `src/agents/reranking_agent/agent.py`, `src/evaluation/question_generator_agent.py`

**HuggingFace:**
- Model downloads for E5 embeddings and T5 propositioner
  - SDK/Client: `transformers>=4.57.1`
  - Auth: None required (public models)
  - Models used:
    - `intfloat/multilingual-e5-small` - Embeddings
    - `chentong00/propositionizer-wiki-flan-t5-large` - Text normalization
  - Implementation: `src/embeddings/e5_small.py`, `src/propositioner/t5_propositioner.py`

## Data Storage

**Vector Database - Qdrant:**
- Purpose: Hybrid search (BM25 + dense vectors)
- Connection: `QDRANT_HOST:QDRANT_PORT` (default: qdrant:6333)
- Collection: `QDRANT_COLLECTION_NAME` env var (default: "documents")
- Client: `qdrant-client>=1.7.0`, `llama-index-vector-stores-qdrant>=0.2.0`
- Docker image: `qdrant/qdrant:latest`
- Configuration: 384-dimension vectors, cosine distance
- Implementation: `src/vectordb/qdrant_db/manager.py`, `src/retrieval/simple_qdrant_retriever.py`

**Document Database - MongoDB:**
- Purpose: Cold storage for sessions, evaluations, questions
- Connection: `MONGODB_URL` env var
- Database: `MONGODB_DATABASE` env var (default: "rag_boilerplate_chat")
- Client: `motor>=3.7.1` (async driver), `beanie>=2.0.0` (ODM)
- Docker image: `mongo:7`
- Auth: `admin:password` (default Docker credentials)
- Implementation: `src/mongodb/client.py`
- Document models:
  - `src/sessions/models.py` - SessionDocument
  - `src/evaluation/models.py` - EvaluationDocument, QuestionDocument, EvaluationResultDocument

**Cache/Message Broker - Redis:**
- Purpose: Session cache (cache-aside pattern), Celery broker, progress tracking
- Connection: `REDIS_HOST:REDIS_PORT/REDIS_DB` (default: redis:6379/0)
- Client: `redis>=7.0.1`
- Docker image: `redis:7-alpine`
- Key patterns:
  - `session:{session_id}` - Session data with TTL
  - `ingestion_progress:{job_id}` - Ingestion job progress
- Implementation: `src/redis/client.py`, `src/distributed_task/progress_tracker.py`

**Alternative Vector Store - ChromaDB:**
- Purpose: Alternative vector database (code exists but Qdrant is primary)
- Connection: `CHROMADB_DB_PATH` env var
- Client: `chromadb>=0.5.0`, `llama-index-vector-stores-chroma>=0.2.0`
- Implementation: `src/chromadb/client.py`

**File Storage:**
- Local filesystem only
- Assets directory: `assets/` for document storage
- Model weights: `embedding_weights/`, `hf_models/`
- Volume mounts in Docker for persistence

**Caching:**
- Redis-based session caching with TTL
- Session expiry: `SESSION_EXPIRY_MINUTES` env var (default: 60)
- Background task migrates expired sessions to MongoDB
- Implementation: `src/sessions/background_tasks.py`

## Authentication & Identity

**Auth Provider:**
- Custom (stub implementation)
- Implementation: `src/auth/` module exists but appears empty/minimal
- No external auth provider integrated

**Current State:**
- No authentication on API endpoints
- No user management
- Sessions are anonymous (UUID-based)

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry or similar)
- Python logging to stdout

**Logs:**
- Standard Python logging module
- Log level configurable via `LOG_LEVEL` env var
- Docker logs aggregation

**Debug UIs (Development only):**
- Redis Commander: Port 8081 - `http://localhost:8081`
- Mongo Express: Port 8082 - `http://localhost:8082`

## CI/CD & Deployment

**Hosting:**
- Docker Compose self-hosted deployment
- No cloud provider integration detected

**CI Pipeline:**
- None detected (no GitHub Actions, GitLab CI, etc.)

**Container Registry:**
- None (builds locally)

## Environment Configuration

**Required env vars:**
- `OPENAI_API_KEY` - Required for all LLM operations
- `QDRANT_HOST` - Vector database host
- `QDRANT_PORT` - Vector database port (default: 6333)
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port (default: 6379)
- `MONGODB_URL` - MongoDB connection string

**Optional env vars:**
- `QDRANT_COLLECTION_NAME` - Collection name (default: "documents")
- `MONGODB_DATABASE` - Database name (default: "rag_boilerplate_chat")
- `SESSION_EXPIRY_MINUTES` - Session TTL (default: 60)
- `EMBEDDING_WEIGHTS_DIR` - Model weights path (default: "embedding_weights")
- `CHROMADB_DB_PATH` - ChromaDB path (if using ChromaDB)
- `DEBUG` - Debug mode flag
- `LOG_LEVEL` - Logging level

**Secrets location:**
- `.env` file (gitignored)
- Copy from `.env.example` for setup

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Task Queue

**Celery:**
- Broker: Redis (`CELERY_BROKER_URL`)
- Backend: Redis (`CELERY_RESULT_BACKEND`)
- Worker config:
  - `task_time_limit`: 24 hours
  - `task_soft_time_limit`: 23 hours
  - `worker_prefetch_multiplier`: 1
  - `task_acks_late`: True
- Implementation: `src/distributed_task/celery_app.py`
- Tasks: `src/distributed_task/ingestion_tasks.py`

## Service Ports

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Gradio UI | 7860 | HTTP | Web interface |
| FastAPI | 8000 | HTTP | REST API |
| Qdrant HTTP | 6333 | HTTP | Vector DB API |
| Qdrant gRPC | 6334 | gRPC | Vector DB gRPC |
| Redis | 6379 | TCP | Cache/broker |
| MongoDB | 27017 | TCP | Document DB |
| Redis Commander | 8081 | HTTP | Debug UI |
| Mongo Express | 8082 | HTTP | Debug UI |

## Inter-Service Communication

**Gradio UI -> FastAPI:**
- HTTP REST calls via `api_client.py`
- Base URL: `http://app:8000` (Docker network)

**FastAPI -> Redis:**
- Direct Redis client connection
- Session cache operations

**FastAPI -> MongoDB:**
- Async Motor driver connection
- Beanie ODM for document operations

**FastAPI -> Qdrant:**
- HTTP client via qdrant-client
- LlamaIndex vector store adapter

**Celery Worker -> Redis:**
- Task queue broker
- Progress tracking storage

**Celery Worker -> Qdrant:**
- Document vector upserts during ingestion

---

*Integration audit: 2026-01-29*
