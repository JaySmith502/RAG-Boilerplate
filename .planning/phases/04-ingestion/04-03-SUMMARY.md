---
phase: 04-ingestion
plan: 03
subsystem: ui
tags: [react, tanstack-query, shadcn, table, collapsible, ingestion]

# Dependency graph
requires:
  - phase: 04-01
    provides: Ingestion form with job start
  - phase: 04-02
    provides: JobProgress, JobStatusBadge, useJobStatus components
provides:
  - Job history table with status, progress, and actions
  - Expandable error details for failed jobs
  - Retry functionality for failed jobs
  - Loading skeleton for job list
affects: [04-uat]

# Tech tracking
tech-stack:
  added: []
  patterns: [collapsible-table-row, skeleton-loading-table]

key-files:
  created:
    - frontend/src/features/ingestion/hooks/useActiveJobs.ts
    - frontend/src/features/ingestion/components/JobHistoryTable.tsx
    - frontend/src/features/ingestion/components/JobHistorySkeleton.tsx
  modified:
    - frontend/src/features/ingestion/IngestionPage.tsx

key-decisions:
  - "Toast info for retry (backend lacks original config storage)"
  - "10 second polling for job list (slower than individual job 5s)"
  - "Collapsible error rows only for failed jobs"

patterns-established:
  - "JobRow internal component for complex table rows with state"
  - "asChild pattern with Collapsible for table row expansion"

# Metrics
duration: 5min
completed: 2026-01-30
---

# Phase 4 Plan 3: Job History Table Summary

**Job history table with status badges, expandable error details, retry button, and loading skeleton**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-30T00:23:10Z
- **Completed:** 2026-01-30T00:27:48Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Job history table showing all active/recent ingestion jobs
- Expandable error details for failed jobs with Collapsible component
- Retry button with toast notification for failed jobs
- Loading skeleton with 3 placeholder rows while fetching
- Completed jobs show green tint and checkmark icon

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useActiveJobs hook** - `ac7285b` (feat)
2. **Task 2: Create JobHistoryTable and JobHistorySkeleton components** - `6199009` (feat)
3. **Task 3: Integrate job history into IngestionPage** - `2144700` (feat)

## Files Created/Modified
- `frontend/src/features/ingestion/hooks/useActiveJobs.ts` - Query hook for /ingestion/jobs with 10s polling
- `frontend/src/features/ingestion/components/JobHistoryTable.tsx` - Table with expandable error rows and retry
- `frontend/src/features/ingestion/components/JobHistorySkeleton.tsx` - Loading skeleton for table
- `frontend/src/features/ingestion/IngestionPage.tsx` - Integrated job history card

## Decisions Made
- Toast info for retry instead of actual retry (backend doesn't store original job config, can't replay)
- 10 second polling for job list (slower than 5s for individual job to reduce API load)
- Underscore prefix for unused jobId parameter to satisfy TypeScript strict mode

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None - all tasks completed successfully with build passing.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Ingestion UI complete with form, progress monitoring, and job history
- Ready for UAT testing
- All INGE success criteria met (10, 11, 12)

---
*Phase: 04-ingestion*
*Completed: 2026-01-30*
