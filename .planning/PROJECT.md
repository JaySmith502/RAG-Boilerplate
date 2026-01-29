# RAG Boilerplate - React UI

## What This Is

A modern React frontend for the RAG document Q&A system, replacing the existing Gradio interface. The new UI provides a polished, customer-facing experience for document chat, retrieval testing, document ingestion, and evaluation workflows — all connecting to the existing FastAPI backend.

## Core Value

External users can interact with the document Q&A system through an intuitive, modern interface that feels professional and trustworthy.

## Requirements

### Validated

- ✓ FastAPI REST API with chat, retrieval, ingestion, and evaluation endpoints — existing
- ✓ Qdrant vector database with hybrid search (BM25 + dense vectors) — existing
- ✓ Redis caching and Celery distributed task queue — existing
- ✓ MongoDB persistent storage for sessions and evaluations — existing
- ✓ CrewAI agents for chat, query enhancement, and reranking — existing
- ✓ Session management with Redis hot/MongoDB cold storage — existing

### Active

- [ ] React frontend with Vite + TypeScript + Tailwind + shadcn/ui
- [ ] Light/dark mode toggle with Modern SaaS aesthetic
- [ ] Chat interface with session management and conversation history
- [ ] Retrieval testing interface with parameter controls
- [ ] Document ingestion interface with progress monitoring
- [ ] Evaluation interface with results comparison
- [ ] Responsive design for desktop and tablet
- [ ] Polished loading states and error handling

### Out of Scope

- Backend API changes — using existing FastAPI endpoints as-is
- Mobile-first design — optimizing for desktop/tablet, mobile is secondary
- Authentication/authorization — not implemented in current backend
- Real-time WebSocket updates — using polling for job status (matches current pattern)

## Context

**Existing System:**
- Backend: FastAPI (port 8000), Celery workers, Redis, MongoDB, Qdrant
- Current UI: Gradio on port 7860 — functional but visually basic
- API Client: `gradio_app/api_client.py` shows all existing API calls

**Design Direction:**
- Modern SaaS aesthetic (Linear, Notion-inspired)
- Card-based layouts with subtle shadows and rounded corners
- Light/dark mode with smooth transitions
- Clear visual hierarchy between containers and interactive elements

**Target Users:**
- External users (customer-facing)
- Need intuitive UX without documentation
- Trust established through professional visual design

## Constraints

- **Tech Stack**: Vite + React + TypeScript + Tailwind + shadcn/ui — chosen for modern defaults and design flexibility
- **Backend Compatibility**: Must work with existing FastAPI endpoints without modifications
- **Port**: New React dev server separate from Gradio (suggest port 3000)
- **Build Output**: Static files that can be served by any HTTP server or containerized

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Replace Gradio with React | Full design control for customer-facing UI | — Pending |
| Use shadcn/ui | High-quality, customizable components with Tailwind | — Pending |
| Keep backend unchanged | Frontend-only project, reduce scope | — Pending |

---
*Last updated: 2026-01-29 after initialization*
