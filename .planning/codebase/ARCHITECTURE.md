# Architecture

**Analysis Date:** 2026-01-29

## Pattern Overview

**Overall:** Layered Service Architecture with Factory Pattern

**Key Characteristics:**
- Netflix/Dispatch project structure (router/service/schemas/models per module)
- Service Layer Pattern with dependency injection via singletons
- Factory Method Pattern for selecting processing pipelines
- Cache-Aside Pattern for session management (Redis hot, MongoDB cold)
- Fan-Out Pattern for distributed document ingestion via Celery

## Layers

**Presentation Layer (Gradio UI):**
- Purpose: Web interface for user interactions
- Location: `gradio_app/`
- Contains: UI components, event handlers, API client wrapper
- Depends on: FastAPI REST API
- Used by: End users

**API Layer (FastAPI):**
- Purpose: RESTful HTTP interface for all operations
- Location: `src/posts/router.py`, `src/sessions/router.py`
- Contains: Route handlers, request validation, response formatting
- Depends on: Service Layer, Celery Tasks
- Used by: Gradio UI, external clients

**Service Layer:**
- Purpose: Business logic and orchestration
- Location: `src/sessions/service.py`, `src/evaluation/service.py`, `src/posts/service.py`
- Contains: Session management, evaluation orchestration, business rules
- Depends on: Data Layer, Agent Layer
- Used by: API Layer

**Agent Layer (CrewAI):**
- Purpose: LLM-powered document processing and chat
- Location: `src/agents/`
- Contains: Chat agents, query enhancement, reranking, retrieval orchestration
- Depends on: Retrieval Layer, LLM APIs (OpenAI)
- Used by: Service Layer

**Retrieval Layer:**
- Purpose: Vector search and document retrieval
- Location: `src/retrieval/`
- Contains: Qdrant retriever, embedding adapters, node builders
- Depends on: Vector DB Layer, Embedding Layer
- Used by: Agent Layer

**Data Processing Layer:**
- Purpose: Document ingestion and chunking pipelines
- Location: `src/data_preprocess_pipelines/`
- Contains: Pipeline orchestrators, chunking strategies
- Depends on: Ingestion Layer, Chunking Layer, Storage Layer
- Used by: Celery Tasks

**Distributed Task Layer (Celery):**
- Purpose: Async document processing with fan-out parallelism
- Location: `src/distributed_task/`
- Contains: Celery tasks, progress tracking
- Depends on: Data Processing Layer, Redis (broker)
- Used by: API Layer

**Data Layer:**
- Purpose: Persistence and caching
- Location: `src/redis/`, `src/mongodb/`, `src/vectordb/`
- Contains: Redis client (cache), MongoDB client (cold storage), Qdrant manager (vectors)
- Depends on: External services
- Used by: Service Layer, Retrieval Layer

## Data Flow

**Chat Request Flow:**

1. Gradio UI sends POST `/chat` with message and optional session_id
2. `src/posts/router.py` receives request, calls `session_service.get_or_create_session()`
3. Session retrieved from Redis (cache-aside), falls back to MongoDB if needed
4. User message added to session via `session_service.add_message_to_session()`
5. `ChatCrew` initialized with embedding model
6. `RetrievalAgent.retrieve()` called with optional query enhancement/reranking
7. If query enhancement: `QueryEnhancerAgent` generates 3 enhanced query variations
8. Qdrant hybrid search (BM25 + dense vectors) retrieves relevant chunks
9. If reranking: `RerankingAgent` uses gpt-4o-mini to reorder by relevance
10. Retrieved context formatted and passed to `ChatCrew.chat()`
11. CrewAI orchestrates response generation with citations
12. Response added to session, returned to client

**Ingestion Flow:**

1. POST `/ingestion/start_job` with folder_path and pipeline_type
2. `ingest_documents_task` Celery task spawned (master task)
3. Master task scans folder, creates subtask group (fan-out pattern)
4. Each `process_single_document_task` runs in parallel:
   - Pipeline selected: `recursive_overlap` or `semantic`
   - PDF ingested via `PDFIngestor` or `PDFDoclingIngestor`
   - Text chunked via chosen strategy
   - E5-small embeddings generated
   - Chunks + vectors upserted to Qdrant
5. Progress tracked via `ProgressTracker` in Redis
6. Master task returns immediately, status polled via GET `/ingestion/status/{job_id}`

**Session Lifecycle:**

1. New session created in Redis with TTL (default 2 minutes)
2. Each access extends TTL via `redis_client.extend_session_ttl()`
3. Background task checks expiring sessions periodically
4. On expiry: session migrated to MongoDB via `session_service.migrate_session_to_mongodb()`
5. Later access loads from MongoDB back to Redis (cache-aside)

**State Management:**
- Session state: Redis (hot) + MongoDB (cold) with TTL-based migration
- Ingestion progress: Redis atomic counters via `ProgressTracker`
- Vector data: Qdrant collection (persisted)
- Evaluation results: MongoDB via Beanie ODM

## Key Abstractions

**DataPreprocessBase:**
- Purpose: Abstract interface for document processing pipelines
- Location: `src/data_preprocess_pipelines/base.py`
- Examples: `DataPreprocessSemantic`, `DataPreprocessRecursiveOverlap`
- Pattern: Template Method - subclasses implement `run_single_doc()`

**BaseEmbedding:**
- Purpose: Abstract interface for embedding models
- Location: `src/embeddings/base.py`
- Examples: `E5SmallEmbedding` at `src/embeddings/e5_small.py`
- Pattern: Strategy - embeddings are pluggable

**BaseChunker:**
- Purpose: Abstract interface for text chunking strategies
- Location: `src/chunking/base.py`
- Examples: `SemanticChunker`, `RecursiveOverlapChunker`
- Pattern: Strategy - chunkers selected by name via `get_chunker()`

**QdrantManager:**
- Purpose: Manages Qdrant client, collection, vector store lifecycle
- Location: `src/vectordb/qdrant_db/manager.py`
- Pattern: Singleton-like - initialized once per pipeline

**SessionService:**
- Purpose: Orchestrates session CRUD across Redis and MongoDB
- Location: `src/sessions/service.py`
- Pattern: Service Layer with Repository abstraction

## Entry Points

**FastAPI Application:**
- Location: `src/main.py`
- Triggers: HTTP requests to port 8000
- Responsibilities: Lifespan management (MongoDB init, Qdrant init, background tasks), route registration

**Celery Worker:**
- Location: `src/distributed_task/celery_app.py`
- Triggers: Tasks from Redis broker
- Responsibilities: Async document processing, progress updates

**Gradio Application:**
- Location: `gradio_app/app.py`
- Triggers: User interactions on port 7860
- Responsibilities: Web UI, API client calls to FastAPI

**Main Entry (dev convenience):**
- Location: `main.py` (root)
- Purpose: Simple uvicorn launcher for development

## Error Handling

**Strategy:** Exception propagation with HTTP status codes

**Patterns:**
- API routes wrap service calls in try/except, convert to HTTPException
- Celery tasks catch exceptions, update progress tracker with failure status
- Services log errors and return None/False for graceful degradation
- Ingestion continues processing other files on single-file failure

## Cross-Cutting Concerns

**Logging:** Python stdlib logging with per-module loggers, level INFO default
**Validation:** Pydantic models for request/response schemas, automatic FastAPI validation
**Authentication:** Not implemented (see `src/auth/` for scaffold)
**Configuration:** Environment variables via dotenv, centralized in `src/config.py`

---

*Architecture analysis: 2026-01-29*
