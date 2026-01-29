# Project Research Summary

**Project:** RAG-Boilerplate Frontend
**Domain:** React SaaS Dashboard for Document Q&A System
**Researched:** 2026-01-29
**Confidence:** MEDIUM-HIGH

## Executive Summary

This project is a React SaaS dashboard frontend connecting to an existing FastAPI backend for a document Q&A system with hybrid search, session management, and evaluation capabilities. Modern SaaS dashboards in this space follow a well-established pattern: TanStack Query for server state management, feature-based component organization, and shadcn/ui for a Linear/Notion aesthetic. The stack is mature and well-documented.

The recommended approach is a phased build starting with foundation (Vite + TypeScript + Tailwind + shadcn/ui), followed by API layer setup with TanStack Query, then feature modules in order of dependency: Chat (core experience), Retrieval Testing (developer tool), Ingestion (document management), and Evaluation (metrics). This order reflects natural user flow and technical dependencies.

Key risks are architectural: (1) Dark mode flash of unstyled content if theme handling is deferred, (2) API race conditions in chat session switching without proper data fetching patterns, and (3) state management sprawl if server state (API data) is mixed with UI state. All three are mitigated by establishing TanStack Query patterns and theme handling in Phase 1 before building features.

## Key Findings

### Recommended Stack

The stack centers on Vite + TypeScript + React + Tailwind CSS + shadcn/ui as specified in requirements, with TanStack ecosystem (Query, Router, Table) for data handling and routing. This combination is industry-standard for modern SaaS dashboards with excellent TypeScript integration and developer experience.

**Core technologies:**
- **Vite + TypeScript + pnpm** — Build tooling with fast HMR and type safety
- **React + Tailwind CSS + shadcn/ui** — UI framework with copy-paste component ownership
- **TanStack Query** — Server state caching, background refetch, optimistic updates
- **TanStack Router** — Type-safe routing with search params for filters/pagination
- **React Hook Form + Zod** — Form handling with schema validation and type inference
- **Zustand** — Minimal UI-only state (theme, sidebar, modals)
- **TanStack Table** — Headless tables for retrieval results and evaluations

**Version verification needed:** React 19, Tailwind v4, Vite 6 may have released since training cutoff. Verify with npm before implementation.

### Expected Features

**Must have (table stakes):**
- Chat message bubbles with user/assistant distinction
- Session list sidebar with new chat button
- Source citations (collapsible)
- Loading indicators and error states with retry
- Sortable data tables with expandable rows
- Progress bar with percentage for ingestion
- Light/dark mode toggle
- Tab navigation between 4 sections

**Should have (competitive):**
- Streaming text responses or typewriter animation
- Source preview on hover
- Copy message button
- Markdown rendering in responses
- Export conversation/results to CSV
- Browser notification when job completes

**Defer (v2+):**
- Message reactions/feedback (requires backend changes)
- Edit and regenerate (requires backend session modification)
- Cancel job (requires backend support)
- Real-time log streaming (requires WebSocket backend)
- Trend charts over time (requires evaluation history aggregation)
- A/B comparison view (high complexity, limited initial value)

### Architecture Approach

Feature-based organization with collocated components, hooks, and API modules per feature. Server state managed exclusively through TanStack Query; UI state through Zustand or React Context. This separation prevents the common pitfall of mixing cached API data with local UI state.

**Major components:**
1. **App shell** (`app/`) — Providers, routing, global error boundary
2. **Shared UI** (`components/`) — shadcn/ui primitives, layout components, common patterns
3. **Feature modules** (`features/`) — Chat, Retrieval, Ingestion, Evaluation each with components/hooks/api.ts
4. **API layer** (`lib/`) — Base client with error handling, TanStack Query configuration

**Data flow:** User Action -> Feature Component -> Custom Hook -> TanStack Query -> Feature API -> Base Client -> FastAPI Backend

### Critical Pitfalls

1. **Dark Mode Flash (FOUC)** — Add inline script in `<head>` before CSS to set theme class immediately from localStorage. Never rely on React state for initial theme.

2. **API Race Conditions** — Use TanStack Query which handles request cancellation and race conditions automatically. Do NOT use raw useEffect + fetch for API calls.

3. **Prop Drilling** — Establish state categories upfront: server state (TanStack Query), UI state (Zustand), URL state (router params), form state (react-hook-form). Query directly in components that need data.

4. **Inconsistent Loading States** — Create skeleton components and error boundaries in Phase 1. Use Suspense boundaries strategically. Every async operation needs visual feedback.

5. **Missing TypeScript Strictness** — Enable `strict: true`, `noImplicitAny`, `strictNullChecks` from day 1. Ban `any` via ESLint. Type all API responses to match backend Pydantic schemas.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation
**Rationale:** All features depend on core infrastructure. Theme handling, routing, and API patterns must be established before feature development to avoid architectural pitfalls.
**Delivers:** Vite + React + TypeScript scaffold, Tailwind + shadcn/ui with theme system, layout shell (sidebar, header, page container), TanStack Query client configuration, base API client with error handling.
**Addresses:** Tab navigation, light/dark mode, consistent loading/error patterns.
**Avoids:** Dark mode FOUC, TypeScript looseness, inconsistent patterns.

### Phase 2: Chat Feature
**Rationale:** Chat is the core user experience. Building it first validates API integration patterns and establishes component patterns that other features will follow.
**Delivers:** Session list sidebar, message display, message input, source citations, loading/error states.
**Uses:** TanStack Query for session data, Zustand for UI state, shadcn/ui components.
**Implements:** Full vertical slice of feature-based architecture.

### Phase 3: Retrieval Testing
**Rationale:** Developer-focused feature with simpler UI requirements. Validates form patterns (react-hook-form + Zod) and data table patterns (TanStack Table).
**Delivers:** Query input with parameter controls, results table with expandable rows, score visualization.
**Uses:** TanStack Table, react-hook-form, Zod schemas.
**Implements:** Retrieval API module, query hook, table patterns.

### Phase 4: Ingestion Management
**Rationale:** Most complex state management (polling for progress). Depends on form patterns from Phase 3.
**Delivers:** Folder/file selection form, job start, progress monitoring with polling, job history table.
**Uses:** TanStack Query with refetchInterval for polling, form patterns.
**Implements:** Long-running job UX pattern with status transitions.

### Phase 5: Evaluation Dashboard
**Rationale:** Builds on all prior patterns. Needs table patterns, status polling, and potentially complex data display.
**Delivers:** Evaluation configuration form, results display, comparison table.
**Uses:** All prior patterns combined.
**Implements:** Metrics display, evaluation comparison.

### Phase 6: Polish and Enhancement
**Rationale:** Refinements after core functionality complete.
**Delivers:** Streaming/typewriter for chat, exports (CSV, conversation), keyboard shortcuts, responsive polish, bundle optimization.
**Addresses:** Competitive differentiators from features research.

### Phase Ordering Rationale

- **Foundation first:** Prevents architectural debt. Theme, error handling, and API patterns are used by every feature.
- **Chat before others:** Validates the full stack, establishes patterns. Most user-facing.
- **Retrieval before Ingestion:** Simpler UI, establishes form and table patterns needed by Ingestion.
- **Ingestion before Evaluation:** Similar complexity (polling, status), but Ingestion is prerequisite for having documents to evaluate.
- **Polish last:** Differentiators are valuable but not blocking. Ship table stakes first.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Ingestion):** Polling pattern complexity, progress state synchronization, edge cases for job failures. May need to verify backend status API contract.
- **Phase 5 (Evaluation):** Metrics visualization approach, comparison UX patterns. Less well-documented domain.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Vite + React + shadcn/ui is extremely well-documented.
- **Phase 2 (Chat):** Chat UI patterns are ubiquitous (ChatGPT, Claude, etc.).
- **Phase 3 (Retrieval):** Standard form + table pattern.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Patterns stable, versions need verification (React 19, Tailwind v4) |
| Features | MEDIUM | Based on established SaaS patterns; no 2025-2026 trend verification |
| Architecture | HIGH | TanStack Query + feature-based organization is well-established |
| Pitfalls | HIGH | Sourced from official React and Tailwind documentation |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Version verification:** React 19, Tailwind v4, Vite 6 may be released. Verify with npm before Phase 1 implementation.
- **Streaming support:** Backend may or may not support SSE for chat streaming. Verify before implementing typewriter effect in Phase 6.
- **Evaluation metrics visualization:** Specific charting library not researched. If Phase 5 needs charts, research during phase planning.
- **Backend API contract:** Types in ARCHITECTURE.md are inferred from Pydantic schemas. Validate exact response shapes during implementation.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode) — Theme handling, FOUC prevention
- [React Documentation](https://react.dev/learn/you-might-not-need-an-effect) — useEffect anti-patterns, data fetching
- [React Suspense Documentation](https://react.dev/reference/react/Suspense) — Loading states, race conditions

### Secondary (MEDIUM confidence)
- Existing codebase analysis — `src/posts/router.py`, `src/*/schemas.py`, `gradio_app/app.py`
- shadcn/ui component patterns — Established community patterns
- TanStack Query/Router patterns — Training knowledge, widely adopted

### Tertiary (LOW confidence)
- Version numbers — Training cutoff May 2025, verify against current npm

---
*Research completed: 2026-01-29*
*Ready for roadmap: yes*
