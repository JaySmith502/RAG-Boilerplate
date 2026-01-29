# Codebase Structure

**Analysis Date:** 2026-01-29

## Directory Layout

```
RAG-Boilerplate/
├── .claude/                    # Claude Code settings
├── .planning/                  # Planning documents
│   └── codebase/               # Codebase analysis docs
├── assets/                     # Document storage
│   └── sample_pdfs3/           # Sample PDFs for testing
├── docs/                       # Documentation
├── embedding_weights/          # Downloaded model weights
├── gradio_app/                 # Web UI application
├── hf_models/                  # Hugging Face model cache
├── legal_chromadb/             # ChromaDB legacy storage
├── requirements/               # Dependency files
├── src/                        # Main source code
│   ├── agents/                 # CrewAI agents
│   ├── auth/                   # Authentication (scaffold)
│   ├── chromadb/               # ChromaDB client (legacy)
│   ├── chunking/               # Text chunking strategies
│   ├── data_preprocess_pipelines/  # Processing pipelines
│   ├── distributed_task/       # Celery tasks
│   ├── embeddings/             # Embedding models
│   ├── evaluation/             # Evaluation system
│   ├── ingestion/              # Document ingestors
│   ├── milvus/                 # Milvus client (unused)
│   ├── mongodb/                # MongoDB client
│   ├── posts/                  # Main API module
│   ├── propositioner/          # T5 propositioner
│   ├── redis/                  # Redis client
│   ├── retrieval/              # Retrieval components
│   ├── sessions/               # Session management
│   └── vectordb/               # Vector database clients
│       ├── chromadb/           # ChromaDB (legacy)
│       ├── milvus/             # Milvus (unused)
│       └── qdrant_db/          # Qdrant (active)
├── templates/                  # Template files
├── docker-compose.yml          # Service orchestration
├── Dockerfile                  # Container build
├── pyproject.toml              # Python project config
├── requirements.txt            # Legacy dependencies
└── uv.lock                     # uv lockfile
```

## Directory Purposes

**`gradio_app/`:**
- Purpose: Gradio web UI for interacting with the RAG system
- Contains: `app.py` (main UI), `api_client.py` (FastAPI wrapper), `components.py` (formatters)
- Key files:
  - `gradio_app/app.py` - Gradio Blocks UI with 4 tabs (Chat, Retrieval, Ingestion, Evaluation)
  - `gradio_app/api_client.py` - HTTP client wrapping all FastAPI endpoints

**`src/agents/`:**
- Purpose: CrewAI-based LLM agents for chat and retrieval enhancement
- Contains: Agent definitions, crew orchestration, tasks
- Key files:
  - `src/agents/chat_agent/crew.py` - ChatCrew orchestrating chat with retrieval
  - `src/agents/retrieval_agent/agent.py` - RetrievalAgent with query enhancement/reranking
  - `src/agents/query_enhancer/agent.py` - LLM-based query variation generator
  - `src/agents/reranking_agent/agent.py` - LLM-based document reranker

**`src/chunking/`:**
- Purpose: Text chunking strategies for document processing
- Contains: Base class, semantic chunker, recursive overlap chunker
- Key files:
  - `src/chunking/base.py` - BaseChunker abstract class
  - `src/chunking/semantic_chunker.py` - Embedding-based semantic boundaries
  - `src/chunking/recursive_overlap_chunker.py` - Fixed-size overlapping chunks
  - `src/chunking/router.py` - Factory function `get_chunker()`

**`src/data_preprocess_pipelines/`:**
- Purpose: Orchestrate document ingestion to vector storage
- Contains: Pipeline implementations combining ingestor + chunker + embedding + storage
- Key files:
  - `src/data_preprocess_pipelines/base.py` - DataPreprocessBase abstract class
  - `src/data_preprocess_pipelines/data_preprocess.py` - Semantic pipeline + singleton
  - `src/data_preprocess_pipelines/data_preprocessrecursiveoverlap.py` - Recursive overlap pipeline + singleton

**`src/distributed_task/`:**
- Purpose: Celery-based async document processing
- Contains: Celery app config, task definitions, progress tracking
- Key files:
  - `src/distributed_task/celery_app.py` - Celery configuration
  - `src/distributed_task/ingestion_tasks.py` - Ingestion task definitions
  - `src/distributed_task/progress_tracker.py` - Redis-based progress tracking

**`src/embeddings/`:**
- Purpose: Embedding model implementations
- Contains: Base class, E5-small implementation
- Key files:
  - `src/embeddings/base.py` - BaseEmbedding abstract class
  - `src/embeddings/e5_small.py` - E5-small-v2 embedding model

**`src/evaluation/`:**
- Purpose: Retrieval quality evaluation (Hit@K, MRR)
- Contains: Evaluation service, metrics, question generation
- Key files:
  - `src/evaluation/service.py` - EvaluationService orchestration
  - `src/evaluation/evaluator.py` - Evaluation execution logic
  - `src/evaluation/metrics.py` - Hit@K and MRR calculation
  - `src/evaluation/models.py` - MongoDB document models

**`src/ingestion/`:**
- Purpose: Document parsing and text extraction
- Contains: PDF ingestors, JSON ingestor, schemas
- Key files:
  - `src/ingestion/pdf_ingestor.py` - Basic PDF text extraction
  - `src/ingestion/pdf_docling_ingestor.py` - Docling-based PDF parsing
  - `src/ingestion/json_ingestor.py` - JSON document ingestion

**`src/posts/`:**
- Purpose: Main API routes (Netflix/Dispatch pattern naming)
- Contains: Router, schemas, service for chat/retrieval/ingestion/evaluation
- Key files:
  - `src/posts/router.py` - All main API endpoints
  - `src/posts/schemas.py` - Request/response Pydantic models

**`src/retrieval/`:**
- Purpose: Vector search and document retrieval
- Contains: Retrievers, embedding adapters, node builders
- Key files:
  - `src/retrieval/simple_qdrant_retriever.py` - LlamaIndex-based Qdrant retriever
  - `src/retrieval/storage_setup.py` - StorageSetup for writing to Qdrant
  - `src/retrieval/node_builder.py` - NodeBuilder for LlamaIndex nodes
  - `src/retrieval/embedding_adapter.py` - Adapter for custom embeddings to LlamaIndex

**`src/sessions/`:**
- Purpose: Chat session management (Redis + MongoDB)
- Contains: Service, models, router, background tasks
- Key files:
  - `src/sessions/service.py` - SessionService with cache-aside pattern
  - `src/sessions/models.py` - Session, Message, SessionDocument models
  - `src/sessions/router.py` - Session API endpoints
  - `src/sessions/background_tasks.py` - TTL migration background task

**`src/vectordb/qdrant_db/`:**
- Purpose: Qdrant vector database client and management
- Contains: Manager, config, client utilities
- Key files:
  - `src/vectordb/qdrant_db/manager.py` - QdrantManager singleton
  - `src/vectordb/qdrant_db/config.py` - Qdrant connection config

**`src/propositioner/`:**
- Purpose: T5-based text normalization for semantic chunking
- Contains: T5 propositioner model
- Key files:
  - `src/propositioner/t5_propositioner.py` - T5Propositioner implementation

## Key File Locations

**Entry Points:**
- `src/main.py`: FastAPI application with lifespan manager
- `src/distributed_task/celery_app.py`: Celery worker entry point
- `gradio_app/app.py`: Gradio UI entry point
- `main.py`: Development convenience launcher

**Configuration:**
- `src/config.py`: Centralized environment variable loading
- `.env`: Environment variables (not committed)
- `.env.example`: Environment variable template
- `docker-compose.yml`: Docker service configuration
- `pyproject.toml`: Python project metadata and dependencies

**Core Logic:**
- `src/posts/router.py`: All main API route handlers
- `src/sessions/service.py`: Session management business logic
- `src/agents/retrieval_agent/agent.py`: Retrieval orchestration
- `src/data_preprocess_pipelines/data_preprocess.py`: Semantic pipeline
- `src/data_preprocess_pipelines/data_preprocessrecursiveoverlap.py`: Recursive overlap pipeline

**Testing:**
- No test files detected in codebase

## Naming Conventions

**Files:**
- snake_case for all Python files: `session_service.py`, `celery_app.py`
- Module structure: `router.py`, `service.py`, `schemas.py`, `models.py` per feature
- Base classes: `base.py` in each module with abstract classes
- Config files: `config.py` for settings, `constants.py` for magic values

**Directories:**
- snake_case for all directories: `distributed_task/`, `data_preprocess_pipelines/`
- Feature-based grouping under `src/`
- Submodules for agents: `chat_agent/`, `query_enhancer/`, `reranking_agent/`

**Classes:**
- PascalCase: `SessionService`, `RetrievalAgent`, `QdrantManager`
- Base classes prefixed with "Base": `BaseEmbedding`, `BaseChunker`
- Document models suffixed with "Document": `SessionDocument`, `EvaluationDocument`

**Functions:**
- snake_case: `get_or_create_session()`, `run_single_doc()`
- Route handlers match HTTP verb: `start_ingestion_job()`, `get_evaluation_status()`

## Where to Add New Code

**New API Endpoint:**
- Add route handler in `src/posts/router.py`
- Add request/response schemas in `src/posts/schemas.py`
- For complex logic, add service method in appropriate service file

**New Feature Module:**
- Create directory: `src/{feature_name}/`
- Add files: `router.py`, `service.py`, `schemas.py`, `models.py`
- Register router in `src/main.py`

**New Agent:**
- Create directory: `src/agents/{agent_name}/`
- Add `agent.py` with agent class
- Optionally add `crew.py` for multi-agent orchestration

**New Chunking Strategy:**
- Add implementation in `src/chunking/{strategy_name}_chunker.py`
- Extend `BaseChunker` from `src/chunking/base.py`
- Register in `src/chunking/router.py` `get_chunker()` factory

**New Embedding Model:**
- Add implementation in `src/embeddings/{model_name}.py`
- Extend `BaseEmbedding` from `src/embeddings/base.py`
- Register in pipeline EMBEDDINGS dict

**New Processing Pipeline:**
- Add in `src/data_preprocess_pipelines/{pipeline_name}.py`
- Extend `DataPreprocessBase`
- Create singleton instance at module level
- Register in `get_pipeline_by_type()` in `src/posts/router.py`

**Utilities:**
- Shared utilities: Add to existing module's `utils.py`
- No global utilities directory - keep utilities close to consumers

**Tests:**
- Create `tests/` directory at project root
- Mirror `src/` structure: `tests/test_{module}.py`

## Special Directories

**`embedding_weights/`:**
- Purpose: Downloaded embedding model weights (E5-small)
- Generated: Yes (auto-downloaded on first run)
- Committed: No (gitignored)

**`hf_models/`:**
- Purpose: Hugging Face model cache
- Generated: Yes
- Committed: No (gitignored)

**`legal_chromadb/`:**
- Purpose: Legacy ChromaDB storage (not used with Qdrant)
- Generated: Yes
- Committed: No (gitignored)

**`assets/`:**
- Purpose: Document storage for ingestion
- Generated: Sample PDFs via `uv run python -m src.assets.prepare_eurlex`
- Committed: Partially (sample_pdfs3 may be committed)

**`.planning/`:**
- Purpose: Project planning and codebase analysis
- Generated: Manually or by tools
- Committed: Yes

---

*Structure analysis: 2026-01-29*
