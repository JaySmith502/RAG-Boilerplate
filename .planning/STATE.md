# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-29)

**Core value:** External users can interact with the document Q&A system through an intuitive, modern interface
**Current focus:** Phase 5 - Evaluation (In progress)

## Current Position

Phase: 5 of 6 (Evaluation)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-01-30 - Completed 05-01-PLAN.md (Evaluation Start Form)

Progress: [█████████████░░░] 81% (13/16 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 13
- Average duration: 3.8 min
- Total execution time: 50 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 4/4 | 18 min | 4.5 min |
| 2. Chat Interface | 3/4 | 11 min | 3.7 min |
| 3. Retrieval Testing | 2/2 | 6 min | 3.0 min |
| 4. Ingestion | 3/3 | 11 min | 3.7 min |
| 5. Evaluation | 1/3 | 4 min | 4.0 min |

**Recent Trend:**
- Last 5 plans: 03-02 (3 min), 04-01 (4 min), 04-02 (2 min), 04-03 (5 min), 05-01 (4 min)
- Trend: Stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Used pnpm as package manager for faster installs and disk efficiency
- Used shadcn/ui new-york style (default) with Neutral base color
- Tailwind v4 uses oklch color format in CSS variables
- Storage key 'vite-ui-theme' used for theme persistence
- Chat page uses fullWidth, other pages use max-w-5xl container
- State-based navigation (URL routing deferred)
- Native fetch over axios for API client (no external HTTP library needed)
- QueryClientProvider is outermost provider (before ThemeProvider)
- ApiError uses explicit property declarations for erasableSyntaxOnly compatibility
- Dark theme uses blue tint (hue 250) for visual depth instead of pure gray
- Dark hierarchy: sidebar (0.13) < background (0.16) < card (0.19)
- Session state lifted to App component for sharing between sidebar and ChatPage
- null sessionId represents "new chat" state
- ChatSessionList conditionally renders only when Chat tab is active
- keepPreviousData used in useSession hook to prevent flash during refetch
- User messages right-aligned with primary color, assistant left-aligned with muted
- Auto-scroll respects user scroll position (disabled when >100px from bottom)
- Enter sends message, Shift+Enter for newline (standard chat UX)
- Optimistic UI shows pending message immediately with opacity reduction
- SourceCitations collapsed by default (user must click to expand)
- Copy button shows checkmark for 2 seconds after successful copy
- Error banner positioned above input for visibility without blocking chat
- useState for retrieval form controls (react-hook-form overkill for 5 fields)
- Slider uses array format value={[topK]} with destructure onValueChange
- Checkbox onCheckedChange uses checked === true for type safety
- Collapsible with asChild wraps fragment for dual-row expand pattern
- useRef for lastRequest enables retry without triggering re-render
- Score displays N/A when null (reranking not used)
- Inline onSuccess callback for mutation to set job ID state
- Warning for zero-file folders (not blocking, just informational)
- File types as checkbox array vs multi-select (simpler for 2 options)
- useRef tracks previous status to fire toast only on transitions (not initial load)
- Polling stops via refetchInterval returning false when status is completed/failed
- JobProgress compact mode for future table row display
- Toast info for retry (backend lacks original config storage)
- 10 second polling for job list (slower than individual job 5s)
- Collapsible error rows only for failed jobs
- Cross-feature import: FolderSelect from ingestion feature for evaluation
- Synchronous mutation pattern for evaluation (no polling needed)
- Questions slider disabled when sourceEvaluationId is set

### Pending Todos

None.

### Blockers/Concerns

- Node.js version warning: Build shows warning about Node.js 22.11.0 (Vite prefers 22.12+), but build completes successfully. Non-blocking.

## Session Continuity

Last session: 2026-01-30T01:00:32Z
Stopped at: Completed 05-01-PLAN.md (Evaluation Start Form)
Resume file: None
