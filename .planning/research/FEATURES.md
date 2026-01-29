# Feature Landscape: Document Q&A SaaS Dashboard

**Domain:** Document Q&A / RAG System Frontend
**Researched:** 2026-01-29
**Confidence:** MEDIUM (based on training data of established SaaS patterns; WebSearch unavailable for 2025-2026 trend verification)

---

## Table Stakes

Features users expect. Missing = product feels incomplete or untrustworthy.

### Chat Interface

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Message bubbles with clear user/assistant distinction | Universal chat UI pattern from ChatGPT, Slack | Low | Use alternating alignment or colors |
| Streaming text responses (typewriter effect) | ChatGPT established this as expected behavior | Medium | Backend must support SSE/streaming; if not, simulate with reveal animation |
| Source citations inline or expandable | RAG systems must show provenance; trust requirement | Medium | Collapsible source cards below each response |
| Copy message button | Standard in all AI chat interfaces | Low | Copy to clipboard with success toast |
| Session persistence | Users expect to return to previous conversations | Low | Already supported by backend |
| Session list/history sidebar | Standard in ChatGPT, Claude, Perplexity | Medium | Left sidebar with session titles |
| New chat button | Must be obvious how to start fresh | Low | Primary action in sidebar header |
| Loading indicator during response | Users need feedback that system is working | Low | Animated dots or skeleton |
| Error state with retry option | Network errors happen; graceful recovery needed | Low | Error banner with "Try again" button |
| Empty state guidance | New users need onboarding | Low | Suggested prompts or welcome message |

### Data Tables (Retrieval Results, Evaluations)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Sortable columns | Basic table functionality | Low | Click header to sort |
| Expandable rows for details | Results have nested content (text, metadata) | Medium | Accordion pattern for document previews |
| Score/relevance visualization | Numbers alone are hard to parse | Low | Progress bars or badges |
| Pagination or virtual scrolling | Large result sets must be manageable | Medium | Pagination simpler, virtual scroll more polished |
| Empty state | No results needs clear messaging | Low | "No results found" with suggestions |
| Loading skeleton | Feedback during data fetch | Low | Shimmer effect on table rows |

### Progress Monitoring (Ingestion)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Progress bar with percentage | Universal expectation for long operations | Low | Linear progress component |
| Current file indicator | Shows system is actually working | Low | "Processing: filename.pdf" |
| Success/failure counts | Users need to know if issues occurred | Low | Green/red counters |
| Time estimates | Reduces anxiety during long operations | Medium | "~5 minutes remaining" |
| Job status badges | Quick visual status (pending, running, done, failed) | Low | Colored badges |
| Job history/list | Users run multiple jobs, need to track all | Medium | Table of recent jobs |
| Error details for failures | Actionable error information | Medium | Expandable error messages per file |

### General UI

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Light/dark mode | Standard in 2024+ SaaS | Medium | CSS variables + toggle in header |
| Responsive layout (desktop/tablet) | Users expect it to work on different screens | Medium | Tailwind breakpoints |
| Consistent loading states | Every async operation needs feedback | Low | Shared loading components |
| Toast notifications | Feedback for actions (copied, saved, error) | Low | shadcn/ui toast component |
| Clear navigation between sections | Users must know where they are | Low | Tab bar or sidebar nav |
| Accessible keyboard navigation | Compliance and UX quality signal | Medium | Focus states, tab order |

---

## Differentiators

Features that set product apart. Not expected but valued. These create "wow" moments.

### Chat Interface

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Source preview on hover | Quick context without leaving chat flow | Medium | Tooltip or popover with doc snippet |
| Multi-turn context indicator | Show what context AI is using | High | Visual thread or context window |
| Suggested follow-up questions | Reduces friction, guides exploration | Medium | Chips below response |
| Export conversation | Business users want records | Low | Download as PDF/text |
| Pin important messages | Save key findings in long sessions | Medium | Star/pin with filtered view |
| Search within conversation | Find past answers in long sessions | Medium | Ctrl+F for chat history |
| Edit and regenerate | Refine questions without retyping | Medium | Edit icon on user messages |
| Markdown rendering | Formatted responses (lists, code, tables) | Low | React-markdown or similar |
| Message reactions/feedback | Collect user sentiment on responses | Medium | Thumbs up/down for training data |

### Data Tables (Retrieval Results)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Document preview modal | Read full context without leaving page | Medium | Modal with scrollable doc content |
| Highlight query matches | Visual confirmation of relevance | Medium | Term highlighting in results |
| Side-by-side comparison | Compare two retrieval configs | High | Split view with synced scrolling |
| Export results to CSV | Power users need data for analysis | Low | Download button |
| Filter by source/score | Drill down into results | Medium | Filter dropdowns/sliders |
| Relevance explanation | Why this doc ranked here (if backend supports) | High | Breakdown of BM25 vs dense scores |

### Progress Monitoring

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Real-time log streaming | Transparency for technical users | High | WebSocket or SSE; backend may not support |
| Cancel job | Stop runaway operations | Medium | Requires backend support |
| Retry failed files only | Efficiency for partial failures | Medium | Selective re-ingestion |
| Notification when complete | Background tab awareness | Medium | Browser notifications API |
| Progress persistence across sessions | Don't lose context if browser closed | Medium | Backend already tracks in Redis |

### Evaluation Interface

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Visual metric comparison | Side-by-side eval comparison | High | Charts showing Hit@K, MRR across configs |
| Drill-down into failures | See which questions failed and why | High | Expandable rows with Q&A detail |
| A/B comparison view | Compare two evaluations directly | High | Split or overlay view |
| Export evaluation report | Documentation for stakeholders | Medium | PDF or markdown export |
| Trend charts over time | Track improvement across evaluations | High | Line charts; requires evaluation history |

### General UI

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Command palette (Cmd+K) | Power user efficiency, Linear-style UX | High | Global search and navigation |
| Keyboard shortcuts | Power user efficiency | Medium | With discoverable hints |
| Customizable dashboard | Users arrange widgets to preference | Very High | Overkill for this scope |
| Onboarding tour | Reduce time to value for new users | Medium | Step-by-step modal walkthrough |
| Help/documentation panel | In-context guidance | Low | ? icon with slide-out panel |

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Auto-playing animations/videos | Distracting, increases load time | Static illustrations, micro-animations only |
| Complex onboarding wizard | Users want to start using immediately | Progressive disclosure, optional tour |
| Infinite scroll everywhere | Loses user position, hard to reference | Pagination for data tables, virtual scroll for chat |
| Real-time collaboration | Way out of scope, massive complexity | Single-user experience is fine |
| PDF viewer integration | Significant complexity, existing viewers exist | Link to source document, let browser/OS handle |
| Custom rich text editor | Massive scope creep | Plain text input with markdown preview |
| Drag-and-drop everything | Often unintuitive, accessibility issues | Clear buttons and forms |
| Sound effects/notifications | Annoying, unprofessional feel | Visual feedback only (toasts, badges) |
| Aggressive auto-refresh | Jarring, loses user context | Manual refresh buttons, optional polling |
| Feature flags visible to users | Confusing, incomplete feel | Ship features complete or not at all |
| AI-generated UI suggestions | Gimmicky, unreliable | Consistent, predictable UI |

---

## Feature Dependencies

```
Core Layout
    |
    +-- Navigation (tabs/sidebar) -- required first
    |
    +-- Theme system (light/dark) -- required first
    |
    +-- Toast notifications -- used by all features

Chat Interface
    |
    +-- Session list (requires: sessions API)
    |       |
    |       +-- Session selection
    |               |
    |               +-- Chat history display
    |                       |
    |                       +-- Message input
    |                               |
    |                               +-- Source citations
    |
    +-- Streaming (requires: backend SSE support OR fallback animation)

Retrieval Testing
    |
    +-- Query input form
    |       |
    |       +-- Parameter controls (sliders, toggles)
    |               |
    |               +-- Results table
    |                       |
    |                       +-- Expandable document preview

Ingestion
    |
    +-- Folder selection (requires: assets API)
    |       |
    |       +-- File type selection
    |               |
    |               +-- Start job button
    |                       |
    |                       +-- Progress display (requires: status polling)
    |                               |
    |                               +-- Job history table

Evaluation
    |
    +-- Configuration form
    |       |
    |       +-- Start evaluation button
    |               |
    |               +-- Results display (requires: evaluation status API)
    |                       |
    |                       +-- Comparison table
```

---

## MVP Recommendation

For MVP, prioritize table stakes with selective differentiators that provide high value at low cost.

### Must Have (Phase 1)

**Chat:**
1. Message bubbles with user/assistant distinction
2. Session list sidebar with new chat button
3. Source citations (collapsible)
4. Loading indicator
5. Error state with retry
6. Empty state with sample prompts

**Retrieval Testing:**
1. Query input with parameter controls (top_k, toggles)
2. Results table with expandable rows
3. Score visualization (progress bars)
4. Loading skeleton

**Ingestion:**
1. Folder dropdown (from assets API)
2. File type checkboxes
3. Progress bar with percentage
4. Current file indicator
5. Job status badges
6. Job history table

**Evaluation:**
1. Configuration form
2. Results display with metrics
3. Comparison table (existing evaluations)

**General:**
1. Tab navigation between 4 sections
2. Light/dark mode toggle
3. Toast notifications
4. Responsive desktop/tablet layout

### Nice to Have (Phase 2)

1. Streaming text responses (if backend supports) or typewriter animation
2. Source preview on hover
3. Copy message button
4. Markdown rendering in responses
5. Export conversation
6. Export results to CSV
7. Browser notification when job completes
8. Keyboard shortcuts (with command palette as stretch)
9. Document preview modal in retrieval results

### Defer to Post-MVP

- Message reactions/feedback: Requires backend changes
- Edit and regenerate: Requires backend session modification
- Cancel job: Requires backend support
- Real-time log streaming: Requires WebSocket backend
- Trend charts over time: Requires evaluation history aggregation
- A/B comparison view: High complexity, limited initial value

---

## Complexity Estimates by Section

| Section | Table Stakes | Differentiators to Include | Total Effort |
|---------|-------------|---------------------------|--------------|
| Chat | ~8 features | 3-4 selective | Medium-High |
| Retrieval | ~5 features | 1-2 selective | Medium |
| Ingestion | ~7 features | 1-2 selective | Medium |
| Evaluation | ~4 features | 1-2 selective | Medium |
| General UI | ~6 features | 1-2 selective | Medium |

**Total MVP Estimate:** Moderate complexity frontend project. The backend APIs already exist; primary work is UI polish and state management.

---

## Sources

**Confidence Note:** This analysis is based on training data (patterns from Linear, Notion, ChatGPT, Perplexity, Vercel, and other modern SaaS products as of early 2025). WebSearch was unavailable to verify 2025-2026 trend shifts. The patterns documented here are well-established and unlikely to have changed significantly.

**Codebase Sources:**
- `gradio_app/app.py` - Existing feature set and API usage patterns
- `src/posts/router.py` - Available API endpoints
- `src/posts/schemas.py` - Request/response shapes
- `src/sessions/router.py` - Session management capabilities
- `src/distributed_task/schemas.py` - Progress tracking schema
- `src/evaluation/schemas.py` - Evaluation data structures
- `.planning/PROJECT.md` - Project requirements and constraints
