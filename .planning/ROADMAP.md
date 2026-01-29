# Roadmap: RAG-Boilerplate React UI

## Overview

This roadmap transforms the existing RAG document Q&A system from a functional Gradio interface into a modern, customer-facing React application. Starting with infrastructure (Vite, TypeScript, Tailwind, shadcn/ui), we build the core chat experience, then layer on developer tools (retrieval testing), document management (ingestion), and metrics (evaluation). The final phase applies design polish to create a cohesive SaaS aesthetic. Each phase delivers a complete, verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Project scaffold, theme system, layout shell, API infrastructure
- [ ] **Phase 2: Chat** - Session management, message display, source citations, chat interactions
- [ ] **Phase 3: Retrieval Testing** - Query form, parameter controls, results table with expansion
- [ ] **Phase 4: Ingestion** - Folder selection, job start, progress monitoring, job history
- [ ] **Phase 5: Evaluation** - Config form, results display, metrics comparison
- [ ] **Phase 6: Design Polish** - SaaS aesthetic refinement, responsive layout, visual consistency

## Phase Details

### Phase 1: Foundation
**Goal**: Developers have a working React application shell with theme support and API infrastructure ready for feature development
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, FOUN-07, FOUN-08
**Success Criteria** (what must be TRUE):
  1. User can load the application and see a layout with sidebar, header, and page container
  2. User can toggle between light and dark mode with immediate visual feedback
  3. User can refresh the page and theme preference is preserved (no flash of wrong theme)
  4. User can navigate between Chat, Retrieval, Ingestion, and Evaluation tabs
  5. API calls show loading states and display error messages on failure
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md - Project scaffold with Vite, TypeScript, Tailwind v4, shadcn/ui
- [x] 01-02-PLAN.md - Theme system with FOUC prevention and layout shell with navigation
- [x] 01-03-PLAN.md - API client with typed fetch and TanStack Query configuration

### Phase 2: Chat
**Goal**: Users can have conversations with the document Q&A system through an intuitive chat interface
**Depends on**: Phase 1
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07, CHAT-08, CHAT-09, CHAT-10, CHAT-11, CHAT-12, CHAT-13
**Success Criteria** (what must be TRUE):
  1. User can see a list of chat sessions in the sidebar and click to view conversation history
  2. User can create a new chat session and immediately start a conversation
  3. User can type a message, send it, and see the assistant response appear with visual distinction
  4. User can view source citations with each assistant response and expand/collapse them
  5. User can copy assistant responses to clipboard with a button click
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md - Install shadcn components, create TanStack Query hooks, add session list to sidebar
- [ ] 02-02-PLAN.md - Message bubbles, message list with auto-scroll, message input with Enter-to-send
- [ ] 02-03-PLAN.md - Collapsible source citations, copy-to-clipboard button, error states with retry

### Phase 3: Retrieval Testing
**Goal**: Developers can test retrieval queries with different parameters and inspect results
**Depends on**: Phase 1
**Requirements**: RETR-01, RETR-02, RETR-03, RETR-04, RETR-05, RETR-06, RETR-07, RETR-08, RETR-09, RETR-10
**Success Criteria** (what must be TRUE):
  1. User can enter a query and configure retrieval parameters (top-k, enhancer, reranking, pipeline)
  2. User can execute a retrieval query and see results in a table with scores
  3. User can expand individual results to view full content
  4. User sees loading skeleton during retrieval and clear error messages on failure
**Plans**: TBD

Plans:
- [ ] 03-01: Query form with parameter controls
- [ ] 03-02: Results table with expansion

### Phase 4: Ingestion
**Goal**: Users can ingest documents into the system and monitor job progress
**Depends on**: Phase 1
**Requirements**: INGE-01, INGE-02, INGE-03, INGE-04, INGE-05, INGE-06, INGE-07, INGE-08, INGE-09, INGE-10, INGE-11, INGE-12
**Success Criteria** (what must be TRUE):
  1. User can select a folder from available assets and configure ingestion options
  2. User can start an ingestion job and see the job ID immediately
  3. User can see a progress bar with percentage and current file being processed
  4. User can view a history of active and recent ingestion jobs
  5. User sees appropriate error handling when jobs fail
**Plans**: TBD

Plans:
- [ ] 04-01: Folder selection and job configuration
- [ ] 04-02: Progress monitoring with polling
- [ ] 04-03: Job history table

### Phase 5: Evaluation
**Goal**: Users can run evaluations and compare results across different configurations
**Depends on**: Phase 1, Phase 4 (needs ingested documents)
**Requirements**: EVAL-01, EVAL-02, EVAL-03, EVAL-04, EVAL-05, EVAL-06, EVAL-07, EVAL-08, EVAL-09, EVAL-10, EVAL-11, EVAL-12, EVAL-13
**Success Criteria** (what must be TRUE):
  1. User can configure evaluation parameters (folder, top-k, enhancer, reranking, questions)
  2. User can start an evaluation and see the evaluation ID
  3. User can select a completed evaluation and view its metrics (hit rate, MRR, avg score)
  4. User can see which configuration was used for each evaluation result
  5. User can compare multiple evaluations side by side in a table
**Plans**: TBD

Plans:
- [ ] 05-01: Evaluation configuration form
- [ ] 05-02: Results display and metrics
- [ ] 05-03: Comparison table

### Phase 6: Design Polish
**Goal**: The application has a cohesive, professional SaaS aesthetic that builds user trust
**Depends on**: Phases 1-5 (all features complete)
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06
**Success Criteria** (what must be TRUE):
  1. Application presents a modern SaaS aesthetic (Linear/Notion-inspired)
  2. All layouts use card-based design with consistent shadows and rounded corners
  3. Visual hierarchy is clear between containers, inputs, and interactive elements
  4. Application is usable on both desktop and tablet screen sizes
**Plans**: TBD

Plans:
- [ ] 06-01: Visual refinement and SaaS aesthetic
- [ ] 06-02: Responsive layout adjustments

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-01-29 |
| 2. Chat | 0/3 | Planned | - |
| 3. Retrieval Testing | 0/2 | Not started | - |
| 4. Ingestion | 0/3 | Not started | - |
| 5. Evaluation | 0/3 | Not started | - |
| 6. Design Polish | 0/2 | Not started | - |

---
*Roadmap created: 2026-01-29*
*Phase 1 planned: 2026-01-29*
*Phase 2 planned: 2026-01-29*
*Total plans: 16 (estimated)*
*Total requirements: 52*
