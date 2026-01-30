# Requirements: RAG-Boilerplate React UI

**Defined:** 2026-01-29
**Core Value:** External users can interact with the document Q&A system through an intuitive, modern interface

## v1 Requirements

### Foundation

- [x] **FOUN-01**: Project scaffolded with Vite + React + TypeScript with strict mode
- [x] **FOUN-02**: Tailwind CSS configured with shadcn/ui components installed
- [x] **FOUN-03**: Light/dark mode toggle with theme persisted to localStorage
- [x] **FOUN-04**: No flash of unstyled content (FOUC) on page load
- [x] **FOUN-05**: Layout shell with sidebar, header, and page container
- [x] **FOUN-06**: Tab navigation between Chat, Retrieval, Ingestion, Evaluation sections
- [x] **FOUN-07**: API client configured with typed fetch and error handling
- [x] **FOUN-08**: TanStack Query configured for server state management

### Chat

- [x] **CHAT-01**: Session list displayed in sidebar
- [x] **CHAT-02**: User can select a session to view its conversation history
- [x] **CHAT-03**: New chat button creates a new session
- [x] **CHAT-04**: Messages displayed as chat bubbles with user/assistant distinction
- [x] **CHAT-05**: Message timestamps displayed
- [x] **CHAT-06**: Text input for composing messages
- [x] **CHAT-07**: Send button submits message to API
- [x] **CHAT-08**: Input cleared after successful send
- [x] **CHAT-09**: Source citations displayed with assistant responses
- [x] **CHAT-10**: Sources are collapsible/expandable
- [x] **CHAT-11**: Loading state shown while waiting for response
- [x] **CHAT-12**: Error state shown with retry option on failure
- [x] **CHAT-13**: Copy message button copies assistant response to clipboard

### Retrieval Testing

- [x] **RETR-01**: Query text input for search terms
- [x] **RETR-02**: Top-K slider to control number of results
- [x] **RETR-03**: Query enhancer toggle checkbox
- [x] **RETR-04**: Reranking toggle checkbox
- [x] **RETR-05**: Pipeline type dropdown (recursive_overlap, semantic)
- [x] **RETR-06**: Retrieve button triggers API call
- [x] **RETR-07**: Results displayed in table with score, source columns
- [x] **RETR-08**: Result text expandable to show full content
- [x] **RETR-09**: Loading skeleton shown during retrieval
- [x] **RETR-10**: Error message with retry button on failure

### Ingestion

- [x] **INGE-01**: Folder dropdown populated from assets API
- [x] **INGE-02**: Refresh button to reload folder list
- [x] **INGE-03**: File type checkboxes (PDF, JSON)
- [x] **INGE-04**: Pipeline type dropdown (recursive_overlap, semantic)
- [x] **INGE-05**: Start ingestion button triggers job
- [x] **INGE-06**: Job ID displayed after job starts
- [x] **INGE-07**: Progress bar shows percentage complete
- [x] **INGE-08**: Status text shows current state and file being processed
- [x] **INGE-09**: Automatic polling updates progress while job is running
- [x] **INGE-10**: Job history table shows active and recent jobs
- [x] **INGE-11**: Loading state for job list
- [x] **INGE-12**: Error handling for failed jobs

### Evaluation

- [x] **EVAL-01**: Folder dropdown for evaluation dataset
- [x] **EVAL-02**: Top-K slider for retrieval parameter
- [x] **EVAL-03**: Query enhancer toggle checkbox
- [x] **EVAL-04**: Reranking toggle checkbox
- [x] **EVAL-05**: Questions per document slider
- [x] **EVAL-06**: Reuse questions dropdown (optional source evaluation)
- [x] **EVAL-07**: Start evaluation button triggers job
- [x] **EVAL-08**: Evaluation ID displayed after job starts
- [x] **EVAL-09**: Results dropdown to select completed evaluation
- [x] **EVAL-10**: Results display shows metrics (hit rate, MRR, avg score)
- [x] **EVAL-11**: Configuration used displayed with results
- [x] **EVAL-12**: Comparison table shows all evaluations side by side
- [x] **EVAL-13**: Loading/error states for evaluation operations

### Design

- [x] **DSGN-01**: Modern SaaS aesthetic (Linear/Notion-inspired)
- [x] **DSGN-02**: Card-based layouts with subtle shadows
- [x] **DSGN-03**: Rounded corners on all interactive elements
- [x] **DSGN-04**: Clear visual hierarchy between containers and inputs
- [x] **DSGN-05**: Consistent spacing and typography
- [x] **DSGN-06**: Responsive layout for desktop and tablet

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhancements

- **ENH-01**: Streaming text responses with typewriter animation
- **ENH-02**: Markdown rendering in chat responses
- **ENH-03**: Keyboard shortcuts (Enter to send, Cmd+K for new chat)
- **ENH-04**: Export conversation to file
- **ENH-05**: Export retrieval/evaluation results to CSV
- **ENH-06**: Browser notification when ingestion job completes
- **ENH-07**: Source preview on hover

### Advanced Features

- **ADV-01**: Message edit and regenerate
- **ADV-02**: Cancel running ingestion job
- **ADV-03**: Real-time log streaming for jobs
- **ADV-04**: Evaluation trend charts over time
- **ADV-05**: A/B comparison view for evaluations

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend API changes | Frontend-only project, using existing endpoints |
| Mobile-first design | Optimizing for desktop/tablet, mobile secondary |
| Authentication | Not implemented in current backend |
| WebSocket real-time updates | Using polling (matches current backend pattern) |
| Message reactions/feedback | Requires backend session modification |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 1 | Complete |
| FOUN-05 | Phase 1 | Complete |
| FOUN-06 | Phase 1 | Complete |
| FOUN-07 | Phase 1 | Complete |
| FOUN-08 | Phase 1 | Complete |
| CHAT-01 | Phase 2 | Complete |
| CHAT-02 | Phase 2 | Complete |
| CHAT-03 | Phase 2 | Complete |
| CHAT-04 | Phase 2 | Complete |
| CHAT-05 | Phase 2 | Complete |
| CHAT-06 | Phase 2 | Complete |
| CHAT-07 | Phase 2 | Complete |
| CHAT-08 | Phase 2 | Complete |
| CHAT-09 | Phase 2 | Complete |
| CHAT-10 | Phase 2 | Complete |
| CHAT-11 | Phase 2 | Complete |
| CHAT-12 | Phase 2 | Complete |
| CHAT-13 | Phase 2 | Complete |
| RETR-01 | Phase 3 | Complete |
| RETR-02 | Phase 3 | Complete |
| RETR-03 | Phase 3 | Complete |
| RETR-04 | Phase 3 | Complete |
| RETR-05 | Phase 3 | Complete |
| RETR-06 | Phase 3 | Complete |
| RETR-07 | Phase 3 | Complete |
| RETR-08 | Phase 3 | Complete |
| RETR-09 | Phase 3 | Complete |
| RETR-10 | Phase 3 | Complete |
| INGE-01 | Phase 4 | Complete |
| INGE-02 | Phase 4 | Complete |
| INGE-03 | Phase 4 | Complete |
| INGE-04 | Phase 4 | Complete |
| INGE-05 | Phase 4 | Complete |
| INGE-06 | Phase 4 | Complete |
| INGE-07 | Phase 4 | Complete |
| INGE-08 | Phase 4 | Complete |
| INGE-09 | Phase 4 | Complete |
| INGE-10 | Phase 4 | Complete |
| INGE-11 | Phase 4 | Complete |
| INGE-12 | Phase 4 | Complete |
| EVAL-01 | Phase 5 | Complete |
| EVAL-02 | Phase 5 | Complete |
| EVAL-03 | Phase 5 | Complete |
| EVAL-04 | Phase 5 | Complete |
| EVAL-05 | Phase 5 | Complete |
| EVAL-06 | Phase 5 | Complete |
| EVAL-07 | Phase 5 | Complete |
| EVAL-08 | Phase 5 | Complete |
| EVAL-09 | Phase 5 | Complete |
| EVAL-10 | Phase 5 | Complete |
| EVAL-11 | Phase 5 | Complete |
| EVAL-12 | Phase 5 | Complete |
| EVAL-13 | Phase 5 | Complete |
| DSGN-01 | Phase 6 | Complete |
| DSGN-02 | Phase 6 | Complete |
| DSGN-03 | Phase 6 | Complete |
| DSGN-04 | Phase 6 | Complete |
| DSGN-05 | Phase 6 | Complete |
| DSGN-06 | Phase 6 | Complete |

**Coverage:**
- v1 requirements: 52 total
- Mapped to phases: 52
- Unmapped: 0

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-01-30 after Phase 6 completion*
