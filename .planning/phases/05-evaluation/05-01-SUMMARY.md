---
phase: 05-evaluation
plan: 01
subsystem: ui
tags: [react, tanstack-query, shadcn-ui, evaluation, forms]

# Dependency graph
requires:
  - phase: 04-ingestion
    provides: FolderSelect component, folder API integration pattern
  - phase: 02-chat
    provides: Form patterns with useState, mutation patterns
provides:
  - useStartEvaluation mutation hook for POST /evaluation/start
  - useEvaluations query hook for GET /evaluations
  - useEvaluation query hook for GET /evaluation/{id}
  - EvaluationForm with folder, top-k, enhancer, reranking, questions controls
  - ReuseQuestionsSelect for reusing questions from previous evaluations
  - EvaluationPage with form integration and result display
affects: [05-02, 05-03, evaluation-results, comparison-table]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Synchronous mutation (no polling needed for evaluation)
    - Cross-feature component import (FolderSelect from ingestion)
    - Questions slider disabled when reusing from previous evaluation

key-files:
  created:
    - frontend/src/features/evaluation/hooks/useStartEvaluation.ts
    - frontend/src/features/evaluation/hooks/useEvaluations.ts
    - frontend/src/features/evaluation/hooks/useEvaluation.ts
    - frontend/src/features/evaluation/components/ReuseQuestionsSelect.tsx
    - frontend/src/features/evaluation/components/EvaluationForm.tsx
  modified:
    - frontend/src/features/evaluation/EvaluationPage.tsx

key-decisions:
  - "Import FolderSelect from ingestion feature (cross-feature import)"
  - "Synchronous mutation pattern for evaluation (no polling needed)"
  - "Questions slider disabled when sourceEvaluationId is set"
  - "Success card shows full evaluation ID with code styling"

patterns-established:
  - "Cross-feature component reuse via import from @/features/{feature}/components"
  - "Conditional slider disable based on related field state"
  - "Success card pattern with green background for completed operations"

# Metrics
duration: 4min
completed: 2026-01-30
---

# Phase 5 Plan 1: Evaluation Start Form Summary

**TanStack Query hooks for evaluation API with EvaluationForm supporting folder selection, retrieval parameters, and question reuse from previous evaluations**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-30T00:56:32Z
- **Completed:** 2026-01-30T01:00:32Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Three TanStack Query hooks for evaluation API endpoints (start, list, detail)
- EvaluationForm with all 6 controls (folder, top-k, enhancer, reranking, questions, reuse)
- ReuseQuestionsSelect component filtering to completed evaluations
- EvaluationPage with form card, success display, and error handling

## Task Commits

Each task was committed atomically:

1. **Task 1: Create evaluation TanStack Query hooks** - `0720be2` (feat)
2. **Task 2: Create ReuseQuestionsSelect and EvaluationForm components** - `9fdb79d` (feat)
3. **Task 3: Wire EvaluationForm into EvaluationPage** - `38dca07` (feat)

## Files Created/Modified
- `frontend/src/features/evaluation/hooks/useStartEvaluation.ts` - Mutation for POST /evaluation/start
- `frontend/src/features/evaluation/hooks/useEvaluations.ts` - Query for GET /evaluations with limit
- `frontend/src/features/evaluation/hooks/useEvaluation.ts` - Query for GET /evaluation/{id}
- `frontend/src/features/evaluation/components/ReuseQuestionsSelect.tsx` - Dropdown for selecting source evaluation
- `frontend/src/features/evaluation/components/EvaluationForm.tsx` - Form with all parameter controls
- `frontend/src/features/evaluation/EvaluationPage.tsx` - Updated page with form and result display

## Decisions Made
- **Cross-feature import:** Reused FolderSelect from ingestion feature rather than duplicating
- **Synchronous mutation:** Unlike ingestion (which polls), evaluation mutation completes when backend finishes
- **Conditional disable:** Questions per doc slider disabled when reusing questions from previous evaluation
- **Success display:** Full evaluation ID shown in monospace code block for easy copying

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - all tasks completed without issues.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Evaluation form functional and ready for testing
- Hooks ready for use by results display and comparison components (05-02, 05-03)
- FolderSelect dependency works correctly across features

---
*Phase: 05-evaluation*
*Completed: 2026-01-30*
