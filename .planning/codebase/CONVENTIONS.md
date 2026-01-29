# Coding Conventions

**Analysis Date:** 2026-01-29

## Naming Patterns

**Files:**
- snake_case for all Python files: `session_service.py`, `pdf_docling_ingestor.py`
- Module files follow component naming: `router.py`, `service.py`, `schemas.py`, `models.py`, `base.py`
- Multi-word names joined with underscores: `data_preprocess.py`, `celery_app.py`
- Constants files: `constants.py`
- Exceptions files: `exceptions.py`

**Classes:**
- PascalCase for all classes: `SessionService`, `E5SmallEmbedding`, `QdrantManager`
- Base classes prefixed with `Base`: `BaseEmbedding`, `BaseChunker`, `BaseIngestor`, `DataPreprocessBase`
- Pydantic models use descriptive names ending with purpose: `ChatRequest`, `ChatResponse`, `EmbeddingInput`, `EmbeddingOutput`
- MongoDB documents end with `Document`: `SessionDocument`, `EvaluationDocument`

**Functions/Methods:**
- snake_case: `get_or_create_session`, `run_single_doc`, `_create_llm`
- Private methods prefixed with underscore: `_ensure_collection`, `_split_text`, `_apply_overlap`
- Async methods use `async def`: `async def initialize()`, `async def get_session_from_mongodb()`

**Variables:**
- snake_case: `session_data`, `chunk_response`, `total_chars`
- Constants in SCREAMING_SNAKE_CASE: `OPENAI_API_KEY`, `REDIS_HOST`, `MONGODB_URL`
- Global singletons in snake_case: `redis_client`, `mongodb_client`, `session_service`

**Types:**
- Type hints used throughout: `def get_session(self, session_id: str) -> Optional[Dict[str, Any]]`
- Typing module imports: `from typing import Optional, List, Dict, Any, Literal`
- Pydantic used for data validation schemas

## Code Style

**Formatting:**
- No explicit formatter configured in repository
- Indentation: Tabs used in some files, spaces in others (inconsistent)
- Line length: No enforced limit observed, some lines exceed 100 characters

**Linting:**
- No linter configuration files present (no `.flake8`, `.pylintrc`, `ruff.toml`)
- Type hints used but no strict type checker enforced
- `# type: ignore` comments used for external library imports: `from crewai import Agent  # type: ignore`

## Import Organization

**Order:**
1. Standard library imports: `import os`, `import time`, `import logging`, `from abc import ABC, abstractmethod`
2. Third-party imports: `from pydantic import BaseModel`, `from fastapi import APIRouter`, `import torch`
3. Local/relative imports: `from .base import BaseChunker`, `from src.config import OPENAI_API_KEY`

**Patterns:**
```python
# Standard library
import os
import time
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from abc import ABC, abstractmethod

# Third-party
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
import torch

# Local imports
from src.config import OPENAI_API_KEY
from .schemas import ChunkRequest, ChunkResponse
from .base import BaseChunker
```

**Path Aliases:**
- No path aliases configured
- Absolute imports from `src`: `from src.config import OPENAI_API_KEY`
- Relative imports within modules: `from .schemas import IngestRequest`

## Error Handling

**Patterns:**
- Try-except with logging: Catch exceptions, log error, return default or re-raise
- HTTPException for API errors: `raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")`
- Optional returns for nullable results: `return None` on failure
- Boolean returns for success/failure operations

**Example Error Handling Pattern:**
```python
async def get_session_from_redis(self, session_id: str) -> Optional[Session]:
    try:
        session_data = self.redis.get_session(session_id)
        if session_data:
            return Session(**session_data)
        return None
    except Exception as e:
        logger.error(f"Error getting session from Redis: {e}")
        return None
```

**Router Error Handling:**
```python
@router.post("/chat", response_model=ChatResponse, tags=["chat"])
async def chat(request: ChatRequest):
    try:
        # ... logic
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
```

## Logging

**Framework:** Python `logging` module

**Configuration:**
```python
import logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
```

**Patterns:**
- Emoji prefixes for visual distinction in Celery tasks: `logger.info(f"🔷 [Task {task_id}] Starting...")`
- Status indicators: `✓` for success, `❌` for errors, `⚠️` for warnings
- Structured log messages with context: `logger.info(f"Retrieved {len(sources)} sources for chat")`

**When to Log:**
- Function entry/exit for long operations
- Processing milestones (ingestion steps, pipeline stages)
- Errors with full context and stack traces
- Success confirmations

## Comments

**When to Comment:**
- Docstrings for public functions and classes
- Inline comments for complex logic
- TODO comments for incomplete implementations

**Docstring Style:**
```python
def retrieve(
    self,
    question: str,
    use_query_enhancer: bool = False,
    use_reranking: bool = False,
    top_k: int = 10
) -> list[dict]:
    """
    Retrieve relevant chunks for a question with optional query enhancement and reranking.

    Args:
        question: The user's question
        use_query_enhancer: If True, enhance query with LLM (default: False)
        use_reranking: If True, rerank documents with LLM (default: False)
        top_k: Number of documents to return (default: 10)

    Returns:
        List of dicts with keys: text, source, score, metadata
    """
```

**JSDoc/TSDoc:**
- Not applicable (Python project)

## Function Design

**Size:**
- Functions range from 5-100+ lines
- Long functions are acceptable for pipeline orchestration (see `run_single_doc`)
- Prefer extracting private helper methods for complex logic

**Parameters:**
- Use keyword arguments with defaults for optional params
- Use Pydantic models for complex input validation
- Type hints on all parameters

**Return Values:**
- Use Pydantic models for structured responses
- Return `Optional[T]` when result may be absent
- Return `Dict[str, Any]` for dynamic result structures
- Use tuples for multiple return values: `def chat(...) -> tuple[str, list[str]]`

## Module Design

**Netflix/Dispatch Project Structure:**
Each feature module contains:
- `router.py`: FastAPI route handlers
- `service.py`: Business logic (service layer)
- `schemas.py`: Pydantic request/response models
- `models.py`: Database/domain models
- `base.py`: Abstract base classes
- `constants.py`: Module constants
- `exceptions.py`: Custom exceptions
- `utils.py`: Helper functions

**Exports:**
- No `__all__` declarations used
- Import from module directly: `from src.sessions.service import session_service`

**Barrel Files:**
- `__init__.py` files present but mostly empty
- Explicit imports preferred over re-exports

## Singleton Pattern

**Global Instances:**
- Instantiated at module level for shared services
- Examples in `src/redis/client.py`, `src/mongodb/client.py`, `src/sessions/service.py`

```python
# Global Redis client instance
redis_client = RedisClient()

# Global MongoDB client instance
mongodb_client = MongoDBClient()

# Global session service instance
session_service = SessionService()
```

**Pipeline Singletons:**
```python
# src/data_preprocess_pipelines/data_preprocess.py
data_preprocess_semantic_pipeline = DataPreprocessSemantic(config=data_preprocess_semantic_config)
```

## Abstract Base Class Pattern

**Interface Definition:**
```python
from abc import ABC, abstractmethod

class BaseEmbedding(ABC):
    def __init__(self, embedding_size: int, embedding_name: str, ...):
        self.embedding_size = embedding_size
        # ... initialization

    @abstractmethod
    def embed(self, input_data: EmbeddingInput) -> EmbeddingOutput:
        pass

    @abstractmethod
    def load(self, weights_path: str):
        pass
```

**Used in:**
- `src/embeddings/base.py` - `BaseEmbedding`
- `src/chunking/base.py` - `BaseChunker`
- `src/ingestion/base.py` - `BaseIngestor`
- `src/data_preprocess_pipelines/base.py` - `DataPreprocessBase`

## Factory Pattern

**Named Factories with Dictionaries:**
```python
# src/data_preprocess_pipelines/data_preprocess.py
INGESTORS: Dict[str, Callable[[], object]] = {
    "pdf": PDFIngestor,
    "pdf-docling": PDFDoclingIngestor,
}

EMBEDDINGS: Dict[str, Callable[[], object]] = {
    "e5-small": E5SmallEmbedding,
}

# Usage
ingestor_cls = INGESTORS[ingestor_name]
self.ingestor = ingestor_cls()
```

## Pydantic Usage

**Schema Definition:**
```python
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ChatResponse(BaseModel):
    message: str
    session_id: str
    sources: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
```

**Beanie Documents (MongoDB):**
```python
from beanie import Document

class SessionDocument(Document):
    session_id: str = Field(index=True, unique=True)
    messages: List[Message] = Field(default_factory=list)

    class Settings:
        name = "chat_sessions"
        indexes = ["session_id", "metadata.created_at"]
```

## Async/Await Patterns

**FastAPI Endpoints:**
- Use `async def` for all route handlers
- Await database operations

**Service Methods:**
```python
async def get_or_create_session(self, session_id: Optional[str] = None) -> Session:
    session = await self.get_session_from_redis(session_id)
    if session:
        return session
    session = await self.get_session_from_mongodb(session_id)
    # ...
```

**Initialization Pattern:**
```python
class MongoDBClient:
    async def initialize(self):
        if self._initialized:
            return
        self._client = AsyncIOMotorClient(MONGODB_URL)
        await init_beanie(database=self._database, document_models=[...])
        self._initialized = True
```

---

*Convention analysis: 2026-01-29*
