# Phase 4: Ingestion - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can ingest documents into the system and monitor job progress. This includes folder selection, job configuration, progress monitoring with polling, and job history display. Job cancellation is supported. Evaluation and search functionality are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Job Configuration Form
- Folder selection approach: Claude's discretion (dropdown with refresh or searchable combobox)
- File type selection: Claude's discretion (checkboxes or radio based on backend)
- Form layout position: Claude's discretion (follow existing page patterns)
- Validation: Claude's discretion (client-side or backend validation)

### Progress Display
- Show both progress bar with percentage AND status text showing current file
- Progress appears in TWO locations: summary below form + full details in job history table
- Polling interval: 5 seconds
- On completion: Both toast notification AND inline visual update (green checkmark)

### Job History Presentation
- Columns: Claude's discretion based on what backend provides
- Number of jobs shown: Claude's discretion (balance usability and performance)
- Status indicators: Colored badges (Running=blue, Complete=green, Failed=red)
- Row actions: Claude's discretion based on backend capabilities

### Error and Edge Cases
- Failed jobs: Red badge with expandable error details (click to see message)
- Empty folder: Prevent submission, show warning if no matching files
- Cancel: Yes, provide cancel button on running jobs
- Retry: Yes, provide retry button on failed jobs (one-click restart with same config)

### Claude's Discretion
- Folder selection UI pattern
- File type input approach
- Form layout and positioning
- Validation approach
- Table column selection
- Job history limit
- Row action availability

</decisions>

<specifics>
## Specific Ideas

- Progress should feel responsive - 5 second polling is the balance
- User wants clear feedback: both toast and inline updates on completion
- Failed jobs should be easy to diagnose (expandable error details) and easy to retry
- Cancel functionality is important for long-running jobs

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-ingestion*
*Context gathered: 2026-01-29*
