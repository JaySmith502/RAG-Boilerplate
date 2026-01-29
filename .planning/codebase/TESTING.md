# Testing Patterns

**Analysis Date:** 2026-01-29

## Test Framework

**Runner:**
- **NOT CONFIGURED** - No test framework detected in the codebase
- No `pytest.ini`, `setup.cfg`, `pyproject.toml` test configuration
- No `tests/` or `test/` directories present
- No test files (`*_test.py`, `test_*.py`, `*_spec.py`) found

**Potential Framework:**
- Project uses `uv` for package management
- Common choice for Python: pytest (not installed in dependencies)

**Run Commands:**
```bash
# Not currently available - framework needs to be added
# Recommended setup:
uv add pytest pytest-asyncio --dev
uv run pytest                    # Run all tests
uv run pytest -v                 # Verbose output
uv run pytest --cov=src          # With coverage
```

## Test File Organization

**Current State:**
- No tests exist in the repository
- No testing infrastructure

**Recommended Location:**
```
project-root/
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Shared fixtures
│   ├── unit/
│   │   ├── __init__.py
│   │   ├── test_embeddings.py
│   │   ├── test_chunking.py
│   │   └── test_sessions.py
│   ├── integration/
│   │   ├── __init__.py
│   │   ├── test_api_routes.py
│   │   └── test_pipelines.py
│   └── fixtures/
│       └── sample_data.py
```

**Recommended Naming:**
- Test files: `test_{module}.py`
- Test functions: `test_{functionality}_{scenario}`
- Fixtures: descriptive names in `conftest.py`

## Test Structure

**Recommended Suite Organization:**
```python
# tests/unit/test_chunking.py
import pytest
from src.chunking.recursive_overlap_chunker import RecursiveOverlapChunker
from src.chunking.schemas import ChunkItem, ChunkRequest, ChunkResponse

class TestRecursiveOverlapChunker:
    """Tests for RecursiveOverlapChunker"""

    @pytest.fixture
    def mock_embedding(self, mocker):
        """Create mock embedding with max_characters set"""
        mock = mocker.MagicMock()
        mock.max_characters = 500
        return mock

    @pytest.fixture
    def chunker(self, mock_embedding):
        """Create chunker instance for testing"""
        return RecursiveOverlapChunker(embedding=mock_embedding)

    def test_chunk_single_item_under_limit(self, chunker):
        """Short text should return single chunk"""
        request = ChunkRequest(items=[
            ChunkItem(source="test.pdf", len_characters=100, text="Short text")
        ])
        response = chunker.chunk(request)
        assert len(response.chunks) == 1
        assert response.chunks[0].text == "Short text"

    def test_chunk_splits_long_text(self, chunker):
        """Long text should be split into multiple chunks"""
        long_text = "This is a sentence. " * 100  # Exceed max_characters
        request = ChunkRequest(items=[
            ChunkItem(source="test.pdf", len_characters=len(long_text), text=long_text)
        ])
        response = chunker.chunk(request)
        assert len(response.chunks) > 1
```

**Patterns:**
- Class-based test organization by component
- Fixtures for common setup
- Descriptive test names explaining scenario

## Mocking

**Recommended Framework:** pytest-mock (mocker fixture)

**Patterns for This Codebase:**
```python
# Mocking external services
@pytest.fixture
def mock_redis_client(mocker):
    """Mock Redis client for session tests"""
    mock = mocker.patch('src.sessions.service.redis_client')
    mock.get_session.return_value = None
    mock.set_session.return_value = True
    return mock

@pytest.fixture
def mock_mongodb_client(mocker):
    """Mock MongoDB client"""
    mock = mocker.patch('src.mongodb.client.mongodb_client')
    mock._initialized = True
    return mock

# Mocking embedding models
@pytest.fixture
def mock_e5_embedding(mocker):
    """Mock E5SmallEmbedding to avoid loading actual model"""
    mock = mocker.MagicMock()
    mock.embed.return_value = EmbeddingOutput(embeddings=[[0.1] * 384])
    mock.max_characters = 1792
    mock.embedding_size = 384
    return mock

# Mocking Qdrant
@pytest.fixture
def mock_qdrant_client(mocker):
    """Mock Qdrant client"""
    mock = mocker.patch('src.vectordb.qdrant_db.manager.QdrantClient')
    return mock
```

**What to Mock:**
- External services: Redis, MongoDB, Qdrant
- ML models: Embedding models, LLMs (avoid loading weights in tests)
- OpenAI API calls
- File system operations for ingestion tests
- Celery task execution

**What NOT to Mock:**
- Pydantic schema validation
- Pure business logic (chunking algorithms, metric calculations)
- Data transformation functions

## Fixtures and Factories

**Recommended Test Data Patterns:**
```python
# tests/conftest.py
import pytest
from datetime import datetime
from src.sessions.models import Session, Message, MessageRole, SessionMetadata
from src.chunking.schemas import ChunkItem, ChunkRequest

@pytest.fixture
def sample_session():
    """Create a sample session for testing"""
    return Session(
        id="test-session-123",
        messages=[
            Message(role=MessageRole.USER, content="Hello"),
            Message(role=MessageRole.ASSISTANT, content="Hi there!")
        ],
        metadata=SessionMetadata(
            created_at=datetime.utcnow(),
            message_count=2
        )
    )

@pytest.fixture
def sample_chunk_request():
    """Create sample chunk request"""
    return ChunkRequest(items=[
        ChunkItem(
            source="document.pdf",
            len_characters=1000,
            text="This is a sample document text for testing chunking functionality."
        )
    ])

@pytest.fixture
def sample_pdf_content():
    """Sample extracted PDF text"""
    return """
    Article 1: Definitions
    For the purposes of this Regulation, the following definitions apply:
    (a) 'personal data' means any information relating to an identified natural person;
    (b) 'processing' means any operation performed on personal data.
    """
```

**Location:**
- Shared fixtures: `tests/conftest.py`
- Module-specific fixtures: within test files
- Sample data files: `tests/fixtures/`

## Coverage

**Requirements:** Not currently enforced

**Recommended Setup:**
```bash
# Install coverage tools
uv add pytest-cov --dev

# Run with coverage
uv run pytest --cov=src --cov-report=html --cov-report=term-missing

# View coverage report
open htmlcov/index.html
```

**Recommended Targets:**
- Critical modules (sessions, retrieval, chunking): 80%+
- Utility modules: 70%+
- Pipeline orchestration: 60%+ (harder to test without infrastructure)

## Test Types

**Unit Tests:**
- Scope: Individual functions and classes
- Speed: Fast (no external dependencies)
- Mock all external services
- Focus on:
  - `src/chunking/` - Chunking algorithms
  - `src/embeddings/` - Embedding interface (mocked models)
  - `src/sessions/` - Session management logic
  - `src/evaluation/metrics.py` - Metric calculations

**Integration Tests:**
- Scope: Module interactions
- Speed: Medium
- May use test containers for Redis/MongoDB
- Focus on:
  - `src/posts/router.py` - API endpoint flows
  - `src/data_preprocess_pipelines/` - Pipeline orchestration
  - `src/sessions/service.py` + Redis/MongoDB interaction

**E2E Tests:**
- Framework: Not currently implemented
- Recommended: Use pytest with httpx for API testing
- Would require running services (Redis, MongoDB, Qdrant)

## Common Patterns

**Async Testing:**
```python
import pytest

@pytest.mark.asyncio
async def test_get_or_create_session(mock_redis_client, mock_mongodb_client):
    """Test session creation when none exists"""
    from src.sessions.service import SessionService

    service = SessionService()
    session = await service.get_or_create_session(None)

    assert session is not None
    assert session.id is not None
    mock_redis_client.set_session.assert_called_once()
```

**Error Testing:**
```python
import pytest
from fastapi.testclient import TestClient
from src.main import app

def test_chat_invalid_session_returns_error():
    """Test that invalid session handling returns proper error"""
    client = TestClient(app)

    response = client.post("/chat", json={
        "message": "Hello",
        "session_id": "nonexistent-session"
    })

    # Should handle gracefully, not 500
    assert response.status_code in [200, 404]

def test_retrieval_empty_query():
    """Test retrieval with empty query returns error"""
    client = TestClient(app)

    response = client.post("/retrieve", json={
        "query": "",
        "top_k": 10
    })

    assert response.status_code == 422  # Validation error
```

**Parameterized Testing:**
```python
import pytest

@pytest.mark.parametrize("pipeline_type,expected_chunker", [
    ("recursive_overlap", "recursive_overlap_chunker"),
    ("semantic", "semantic_chunker"),
])
def test_pipeline_selection(pipeline_type, expected_chunker):
    """Test correct pipeline is selected based on type"""
    from src.posts.router import get_pipeline_by_type

    pipeline = get_pipeline_by_type(pipeline_type)
    assert pipeline.chunker.name == expected_chunker
```

## Recommended Test Infrastructure

**Dependencies to Add:**
```toml
# pyproject.toml
[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "pytest-cov>=4.0.0",
    "pytest-mock>=3.10.0",
    "httpx>=0.24.0",  # For async API testing
    "testcontainers>=3.7.0",  # For integration tests
]
```

**pytest.ini Configuration:**
```ini
# pytest.ini
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
filterwarnings =
    ignore::DeprecationWarning
```

## Current Testing Gap Analysis

**Critical Missing Tests:**

| Module | Priority | Reason |
|--------|----------|--------|
| `src/sessions/service.py` | High | Core session management, data persistence |
| `src/chunking/*.py` | High | Text processing algorithms, directly affects quality |
| `src/posts/router.py` | High | API contract, user-facing endpoints |
| `src/retrieval/*.py` | High | Search quality, core functionality |
| `src/evaluation/metrics.py` | Medium | Evaluation accuracy |
| `src/agents/*.py` | Medium | LLM integration (mock OpenAI) |
| `src/data_preprocess_pipelines/*.py` | Medium | Pipeline orchestration |
| `src/distributed_task/*.py` | Low | Celery tasks (harder to unit test) |

**Recommendations:**
1. Add pytest and related dev dependencies
2. Create `tests/` directory structure
3. Start with unit tests for `src/chunking/` and `src/sessions/`
4. Add integration tests for API routes
5. Consider test containers for Redis/MongoDB integration tests

---

*Testing analysis: 2026-01-29*
