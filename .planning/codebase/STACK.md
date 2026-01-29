# Technology Stack

**Analysis Date:** 2026-01-29

## Languages

**Primary:**
- Python 3.10+ - All backend, API, workers, and UI code

**Secondary:**
- None detected

## Runtime

**Environment:**
- Python 3.10 (main app Dockerfile)
- Python 3.11 (Gradio UI Dockerfile)

**Package Manager:**
- uv (Astral) - Fast Python package manager
- Lockfile: `uv.lock` present

## Frameworks

**Core:**
- FastAPI >=0.120.2 - REST API framework
- Gradio >=4.0.0 - Web UI framework
- CrewAI >=1.2.1 - Multi-agent orchestration
- LlamaIndex >=0.14.6 - Vector store indexing and retrieval
- LangChain >=1.0.3 - LLM chain utilities

**Testing:**
- Not detected (no test framework in dependencies)

**Build/Dev:**
- Docker + Docker Compose - Containerized deployment
- uv - Dependency management and virtual environments

## Key Dependencies

**Critical:**
- `openai>=1.109.1` - OpenAI API client for GPT-4o-mini
- `qdrant-client>=1.7.0` - Qdrant vector database client
- `transformers>=4.57.1` - HuggingFace models (E5 embeddings, T5 propositioner)
- `torch` - PyTorch for ML model inference
- `celery[redis]>=5.3.1` - Distributed task queue

**Infrastructure:**
- `redis>=7.0.1` - Redis client for caching and Celery broker
- `motor>=3.7.1` - Async MongoDB driver
- `beanie>=2.0.0` - MongoDB ODM (Object Document Mapper)
- `langchain-openai>=1.0.1` - LangChain OpenAI integration

**Document Processing:**
- `docling>=2.59.0` - PDF document parsing
- `pypdf2>=3.0.1` - PDF manipulation
- `pytesseract>=0.3.13` - OCR support
- `easyocr>=1.7.2` - Alternative OCR
- `rapidocr>=3.4.2` - Fast OCR

**NLP:**
- `nltk>=3.9.2` - Natural language processing
- `spacy>=3.8.7` - NLP pipeline
- `en-core-web-sm` - spaCy English model
- `sentencepiece>=0.2.1` - Text tokenization
- `langchain-text-splitters>=1.0.0` - Text chunking utilities

**Vector Stores (Multiple options available):**
- `llama-index-vector-stores-qdrant>=0.2.0` - Qdrant integration (primary)
- `llama-index-vector-stores-chroma>=0.2.0` - ChromaDB integration (alternative)
- `chromadb>=0.5.0` - ChromaDB client (alternative)

## Configuration

**Environment:**
- `.env` file for configuration (copy from `.env.example`)
- `python-dotenv>=1.2.1` loads environment variables
- Configuration centralized in `src/config.py`

**Key env vars required:**
- `OPENAI_API_KEY` - OpenAI API authentication
- `QDRANT_HOST`, `QDRANT_PORT`, `QDRANT_COLLECTION_NAME` - Vector DB
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB` - Redis connection
- `MONGODB_URL`, `MONGODB_DATABASE` - MongoDB connection
- `EMBEDDING_WEIGHTS_DIR` - Model weights storage path

**Build:**
- `Dockerfile` - Main app container (Python 3.10-slim)
- `gradio_app/Dockerfile` - Gradio UI container (Python 3.11-slim)
- `docker-compose.yml` - Multi-service orchestration
- `pyproject.toml` - Python project configuration

## Platform Requirements

**Development:**
- Python 3.10+
- Docker and Docker Compose
- uv package manager
- CUDA optional (for GPU acceleration)
- MPS optional (for Apple Silicon)

**Production:**
- Docker Compose deployment
- Services: app, redis, mongodb, qdrant, celery-worker, gradio-ui
- Optional: redis-commander (debug UI), mongo-express (debug UI)

**System Dependencies (Dockerfile):**
- tesseract-ocr - OCR engine
- poppler-utils - PDF utilities
- libgl1, libglib2.0-0, etc. - OpenCV/image processing

## Embedding Model

**Primary:**
- `intfloat/multilingual-e5-small` - 384-dimension multilingual embeddings
- Loaded via HuggingFace transformers
- Supports CUDA, MPS (Apple Silicon), and CPU inference

**Propositioner Model:**
- `chentong00/propositionizer-wiki-flan-t5-large` - T5 model for text normalization
- Used in semantic chunking pipeline

## LLM Configuration

**Model:**
- OpenAI GPT-4o-mini - Primary LLM for all agents
- Temperature: 0.7 (default)

**Agents using LLM:**
- ChatAgent - Answer generation with citations
- QueryEnhancerAgent - Query expansion
- RerankingAgent - Document reranking
- QuestionGeneratorAgent - Evaluation question generation
- RetrievalAgent - Legal research assistant

---

*Stack analysis: 2026-01-29*
