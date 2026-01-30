# Phase 4: Ingestion - Research

**Researched:** 2026-01-29
**Domain:** React job management UI with TanStack Query polling, shadcn/ui forms and progress components
**Confidence:** HIGH

## Summary

This phase implements an ingestion interface for starting document processing jobs, monitoring their progress in real-time, and viewing job history. The existing codebase provides a solid foundation: React 19, TanStack Query v5, Tailwind CSS v4, shadcn/ui components, a typed API client, and full TypeScript types for the ingestion endpoints (`/ingestion/start_job`, `/ingestion/status/{job_id}`, `/ingestion/jobs`, `/assets/list`).

The key implementation patterns are: (1) TanStack Query's `refetchInterval` for progress polling that stops when job completes, (2) `useMutation` for starting jobs, (3) shadcn/ui Progress component for visual feedback, and (4) Badge components for status indicators. The backend already provides comprehensive progress data including percentage, current file, success/failure counts, and estimated time remaining.

**Primary recommendation:** Use `useQuery` with conditional `refetchInterval` for progress polling (5 seconds per CONTEXT.md), `useMutation` for starting jobs, and a job history table with colored status badges. Cancel functionality requires a backend endpoint that doesn't currently exist - research this as an open question.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-query | ^5.90.20 | Server state, polling | Conditional refetchInterval for progress monitoring |
| React | ^19.2.0 | UI framework | Already in project |
| Tailwind CSS | ^4.1.18 | Styling | Already configured |
| shadcn/ui | latest | UI components | Already configured, provides accessible components |
| lucide-react | ^0.563.0 | Icons | Already installed |
| sonner | ^2.0.7 | Toast notifications | Already installed |

### Supporting (To Install via shadcn)
| Component | Purpose | When to Use |
|-----------|---------|-------------|
| progress | Job progress display | Progress bar for active jobs |
| badge | Status indicators | Running/Complete/Failed status badges |

**Installation:**
```bash
cd frontend
pnpm dlx shadcn@latest add progress badge
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useQuery polling | WebSocket | Backend doesn't support WebSocket; polling is sufficient for 5s updates |
| refetchInterval | setInterval | TanStack Query handles cleanup, error recovery, and stale data |
| Conditional refetchInterval | refetch() manual calls | Function-based refetchInterval is cleaner, auto-stops |

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/features/ingestion/
├── IngestionPage.tsx           # Main page component
├── components/
│   ├── IngestionForm.tsx       # Folder select, file types, pipeline, start button
│   ├── JobProgress.tsx         # Progress bar with current file and stats
│   ├── JobHistoryTable.tsx     # Table of active/recent jobs
│   ├── JobStatusBadge.tsx      # Colored status badge component
│   └── FolderSelect.tsx        # Folder dropdown with refresh button
├── hooks/
│   ├── useFolders.ts           # Query for /assets/list
│   ├── useStartJob.ts          # Mutation for /ingestion/start_job
│   ├── useJobStatus.ts         # Polling query for /ingestion/status/{job_id}
│   └── useActiveJobs.ts        # Query for /ingestion/jobs
└── types.ts                    # Local type definitions (if needed)
```

### Pattern 1: Conditional Polling with refetchInterval Function
**What:** Use `refetchInterval` as a function that returns `false` to stop polling when job completes
**When to use:** Progress monitoring for active jobs
**Example:**
```typescript
// Source: TanStack Query v5 docs - refetchInterval as function
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { TaskProgress } from '@/types/api'

export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['ingestion', 'status', jobId],
    queryFn: () => apiClient<TaskProgress>(`/ingestion/status/${jobId}`),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data
      // Stop polling when job completes or fails
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false
      }
      return 5000 // 5 second polling per CONTEXT.md
    },
  })
}
```

### Pattern 2: useMutation for Starting Jobs
**What:** Use `useMutation` for the POST `/ingestion/start_job` endpoint
**When to use:** Starting new ingestion jobs
**Example:**
```typescript
// frontend/src/features/ingestion/hooks/useStartJob.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { IngestionJobRequest, IngestionJobResponse } from '@/types/api'

export function useStartJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: IngestionJobRequest) => {
      return apiClient<IngestionJobResponse>('/ingestion/start_job', {
        method: 'POST',
        body: request,
      })
    },
    onSuccess: () => {
      // Refresh active jobs list
      queryClient.invalidateQueries({ queryKey: ['ingestion', 'jobs'] })
    },
  })
}
```

### Pattern 3: Progress Display with Dual Location
**What:** Show progress both inline (below form) and in job history table
**When to use:** Per CONTEXT.md - progress appears in TWO locations
**Example:**
```typescript
// JobProgress.tsx - reusable progress component
import { Progress } from '@/components/ui/progress'
import type { TaskProgress } from '@/types/api'

interface JobProgressProps {
  progress: TaskProgress
  compact?: boolean // For table row display
}

export function JobProgress({ progress, compact = false }: JobProgressProps) {
  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      <div className="flex items-center justify-between">
        <span className={compact ? 'text-xs' : 'text-sm'}>
          {progress.progress_percentage?.toFixed(0) ?? 0}%
        </span>
        {!compact && (
          <span className="text-xs text-muted-foreground">
            {progress.processed_documents}/{progress.total_documents} files
          </span>
        )}
      </div>
      <Progress value={progress.progress_percentage ?? 0} />
      {progress.current_file && !compact && (
        <p className="text-xs text-muted-foreground truncate">
          Processing: {progress.current_file}
        </p>
      )}
    </div>
  )
}
```

### Pattern 4: Status Badge Component
**What:** Colored badges for job status per CONTEXT.md (Running=blue, Complete=green, Failed=red)
**When to use:** Job history table status column
**Example:**
```typescript
// JobStatusBadge.tsx
import { Badge } from '@/components/ui/badge'
import type { IngestionStatus } from '@/types/api'

const statusConfig: Record<IngestionStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  pending: { variant: 'outline', label: 'Pending' },
  processing: { variant: 'default', label: 'Running' }, // default is blue-ish
  chunking: { variant: 'default', label: 'Chunking' },
  indexing: { variant: 'default', label: 'Indexing' },
  completed: { variant: 'secondary', label: 'Complete' }, // Override with green
  failed: { variant: 'destructive', label: 'Failed' },
}

export function JobStatusBadge({ status }: { status: IngestionStatus }) {
  const config = statusConfig[status] ?? { variant: 'outline', label: status }

  return (
    <Badge
      variant={config.variant}
      className={status === 'completed' ? 'bg-green-500 hover:bg-green-500/80' : undefined}
    >
      {config.label}
    </Badge>
  )
}
```

### Pattern 5: Folder Select with Refresh
**What:** Dropdown populated from `/assets/list` with refresh button
**When to use:** Job configuration form
**Example:**
```typescript
// FolderSelect.tsx
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFolders } from '../hooks/useFolders'

interface FolderSelectProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function FolderSelect({ value, onChange, disabled }: FolderSelectProps) {
  const { data, isPending, refetch, isFetching } = useFolders()

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select folder..." />
        </SelectTrigger>
        <SelectContent>
          {data?.folders.map((folder) => (
            <SelectItem key={folder.path} value={folder.path}>
              {folder.name} ({folder.file_count ?? 0} files)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => refetch()}
        disabled={isFetching}
      >
        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}
```

### Pattern 6: Toast on Completion/Failure
**What:** Show toast notification when job completes or fails per CONTEXT.md
**When to use:** When useJobStatus detects status change to completed/failed
**Example:**
```typescript
// In IngestionPage or a useEffect in JobProgress
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { CheckCircle, XCircle } from 'lucide-react'

// Track previous status to detect changes
const prevStatusRef = useRef<string | undefined>()

useEffect(() => {
  if (!progress) return

  const prevStatus = prevStatusRef.current
  prevStatusRef.current = progress.status

  // Only toast on transition to completed/failed
  if (prevStatus && prevStatus !== progress.status) {
    if (progress.status === 'completed') {
      toast.success('Ingestion Complete', {
        description: `Successfully processed ${progress.successful_documents} files`,
        icon: <CheckCircle className="h-4 w-4" />,
      })
    } else if (progress.status === 'failed') {
      toast.error('Ingestion Failed', {
        description: progress.error_message ?? 'Unknown error',
        icon: <XCircle className="h-4 w-4" />,
      })
    }
  }
}, [progress?.status])
```

### Anti-Patterns to Avoid
- **Polling without stop condition:** Always use conditional `refetchInterval` that returns `false` when done
- **Manual setInterval for polling:** TanStack Query handles cleanup, error recovery, window focus
- **Hardcoding folder paths:** Use `/assets/list` endpoint to populate dropdown
- **Polling in background tabs:** Default behavior pauses polling when tab loses focus (desirable)
- **Not showing job ID after start:** Per INGE-06, display job_id immediately after starting

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Progress bar | Custom div with width % | shadcn Progress | Accessible, animated, consistent |
| Status badges | Custom span with colors | shadcn Badge | Variants for different states |
| Polling logic | setInterval + useState | TanStack Query refetchInterval | Cleanup, error handling, stale data |
| Folder dropdown | Custom dropdown | shadcn Select | Portal, keyboard nav, accessibility |
| Toast notifications | Custom alert | sonner (already installed) | Stacking, auto-dismiss, positioning |

**Key insight:** TanStack Query's `refetchInterval` as a function provides clean conditional polling without manual cleanup. The pattern `(query) => data.isComplete ? false : 5000` is idiomatic.

## Common Pitfalls

### Pitfall 1: Polling Forever After Completion
**What goes wrong:** useQuery keeps polling even after job completes
**Why it happens:** Using a fixed `refetchInterval: 5000` instead of function form
**How to avoid:** Use `refetchInterval: (query) => { ... return false when done }`
**Warning signs:** Network tab shows continued requests after job completion

### Pitfall 2: Missing Job ID State After Start
**What goes wrong:** Can't poll for status because job_id wasn't captured
**Why it happens:** Not storing mutation response data
**How to avoid:** Use `const [currentJobId, setCurrentJobId] = useState<string | null>(null)` and set in `onSuccess`
**Warning signs:** Progress component never shows, useJobStatus always disabled

### Pitfall 3: Stale Folder List
**What goes wrong:** New folders in assets/ not appearing in dropdown
**Why it happens:** Not providing refresh mechanism
**How to avoid:** Add refresh button that calls `refetch()` per INGE-02
**Warning signs:** User adds folder to assets/, doesn't appear in UI

### Pitfall 4: No Loading State for Jobs List
**What goes wrong:** UI appears broken while fetching jobs
**Why it happens:** Not showing skeleton/spinner during `isPending`
**How to avoid:** Per INGE-11, show loading state for job list
**Warning signs:** Blank table that suddenly populates

### Pitfall 5: Empty Folder Submission
**What goes wrong:** Starting job on folder with no matching files
**Why it happens:** Not checking file count before allowing submission
**How to avoid:** Per CONTEXT.md, prevent submission and show warning if no matching files
**Warning signs:** Job starts and immediately completes with 0 files

### Pitfall 6: Error Details Not Expandable
**What goes wrong:** User can't diagnose why job failed
**Why it happens:** Only showing status badge, not error message
**How to avoid:** Per CONTEXT.md, failed jobs have expandable error details (click to see message)
**Warning signs:** Red "Failed" badge with no way to see error

### Pitfall 7: Missing Inline Completion Indicator
**What goes wrong:** User doesn't notice job completed without watching
**Why it happens:** Only using toast, not inline visual update
**How to avoid:** Per CONTEXT.md, show BOTH toast AND inline visual update (green checkmark)
**Warning signs:** Progress area looks the same after completion

## Code Examples

### Complete useFolders Hook
```typescript
// frontend/src/features/ingestion/hooks/useFolders.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { AssetsListResponse } from '@/types/api'

export function useFolders() {
  return useQuery({
    queryKey: ['assets', 'folders'],
    queryFn: () => apiClient<AssetsListResponse>('/assets/list'),
  })
}
```

### Complete useActiveJobs Hook
```typescript
// frontend/src/features/ingestion/hooks/useActiveJobs.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

interface ActiveJob {
  job_id: string
  status: string
  progress_percentage: number | null
  updated_at: string | null
}

interface ActiveJobsResponse {
  active_jobs: ActiveJob[]
}

export function useActiveJobs() {
  return useQuery({
    queryKey: ['ingestion', 'jobs'],
    queryFn: () => apiClient<ActiveJobsResponse>('/ingestion/jobs'),
    refetchInterval: 10000, // Refresh every 10s for job history
  })
}
```

### IngestionForm with Validation
```typescript
// frontend/src/features/ingestion/components/IngestionForm.tsx
import { useState } from 'react'
import { Loader2, Play, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FolderSelect } from './FolderSelect'
import type { PipelineType, IngestionJobRequest } from '@/types/api'
import { useFolders } from '../hooks/useFolders'

interface IngestionFormProps {
  onSubmit: (request: IngestionJobRequest) => void
  isPending: boolean
}

export function IngestionForm({ onSubmit, isPending }: IngestionFormProps) {
  const [folderPath, setFolderPath] = useState('')
  const [includePdf, setIncludePdf] = useState(true)
  const [includeJson, setIncludeJson] = useState(false)
  const [pipelineType, setPipelineType] = useState<PipelineType>('recursive_overlap')

  const { data: foldersData } = useFolders()

  // Find selected folder to check file count
  const selectedFolder = foldersData?.folders.find(f => f.path === folderPath)
  const hasNoFiles = selectedFolder && selectedFolder.file_count === 0

  // Build file types array
  const fileTypes: string[] = []
  if (includePdf) fileTypes.push('pdf')
  if (includeJson) fileTypes.push('json')

  const canSubmit = folderPath && fileTypes.length > 0 && !hasNoFiles && !isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    onSubmit({
      folder_path: folderPath,
      file_types: fileTypes,
      pipeline_type: pipelineType,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Folder Selection */}
      <div className="space-y-2">
        <Label>Source Folder</Label>
        <FolderSelect
          value={folderPath}
          onChange={setFolderPath}
          disabled={isPending}
        />
        {hasNoFiles && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Selected folder has no files
          </p>
        )}
      </div>

      {/* File Types */}
      <div className="space-y-2">
        <Label>File Types</Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pdf"
              checked={includePdf}
              onCheckedChange={(checked) => setIncludePdf(checked === true)}
              disabled={isPending}
            />
            <Label htmlFor="pdf" className="cursor-pointer">PDF</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="json"
              checked={includeJson}
              onCheckedChange={(checked) => setIncludeJson(checked === true)}
              disabled={isPending}
            />
            <Label htmlFor="json" className="cursor-pointer">JSON</Label>
          </div>
        </div>
        {fileTypes.length === 0 && (
          <p className="text-sm text-destructive">Select at least one file type</p>
        )}
      </div>

      {/* Pipeline Type */}
      <div className="space-y-2">
        <Label>Pipeline Type</Label>
        <Select
          value={pipelineType}
          onValueChange={(value) => setPipelineType(value as PipelineType)}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recursive_overlap">Recursive Overlap (Fast)</SelectItem>
            <SelectItem value="semantic">Semantic (Accurate)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={!canSubmit}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Start Ingestion
          </>
        )}
      </Button>
    </form>
  )
}
```

### Job History Table with Expandable Error
```typescript
// JobHistoryTable.tsx - with expandable error details per CONTEXT.md
import { useState } from 'react'
import { ChevronDown, RotateCcw, XCircle, CheckCircle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { JobStatusBadge } from './JobStatusBadge'
import { JobProgress } from './JobProgress'
import { cn } from '@/lib/utils'
import type { TaskProgress } from '@/types/api'

interface JobHistoryTableProps {
  jobs: TaskProgress[]
  onRetry?: (jobId: string) => void
}

function JobRow({ job, onRetry }: { job: TaskProgress; onRetry?: (jobId: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const hasFailed = job.status === 'failed'
  const isComplete = job.status === 'completed'
  const isRunning = ['processing', 'chunking', 'indexing', 'pending'].includes(job.status)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <>
        <TableRow
          className={cn(
            hasFailed && 'cursor-pointer hover:bg-muted/50',
            isComplete && 'bg-green-50/50 dark:bg-green-950/20'
          )}
          onClick={() => hasFailed && setIsOpen(!isOpen)}
        >
          <TableCell className="font-mono text-xs">{job.job_id.slice(0, 8)}...</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <JobStatusBadge status={job.status} />
              {isComplete && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
          </TableCell>
          <TableCell>
            {isRunning && job.progress_percentage !== undefined ? (
              <JobProgress progress={job} compact />
            ) : isComplete ? (
              <span className="text-sm">
                {job.successful_documents}/{job.total_documents} files
              </span>
            ) : hasFailed ? (
              <span className="text-sm text-destructive">Click for details</span>
            ) : null}
          </TableCell>
          <TableCell>
            {hasFailed && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRetry(job.job_id)
                }}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
            {hasFailed && (
              <ChevronDown className={cn(
                'h-4 w-4 ml-2 transition-transform inline-block',
                isOpen && 'rotate-180'
              )} />
            )}
          </TableCell>
        </TableRow>
        {hasFailed && (
          <CollapsibleContent asChild>
            <TableRow>
              <TableCell colSpan={4} className="bg-destructive/10 border-destructive/20">
                <div className="flex items-start gap-2 p-2">
                  <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Error Details</p>
                    <p className="text-sm text-muted-foreground">
                      {job.error_message ?? 'Unknown error'}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </CollapsibleContent>
        )}
      </>
    </Collapsible>
  )
}

export function JobHistoryTable({ jobs, onRetry }: JobHistoryTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No ingestion jobs yet. Start one above!
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <JobRow key={job.job_id} job={job} onRetry={onRetry} />
        ))}
      </TableBody>
    </Table>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| setInterval for polling | TanStack Query refetchInterval | 2020+ | Automatic cleanup, error handling |
| Fixed refetchInterval | Function-based refetchInterval | TanStack Query v4+ | Conditional polling, stop on completion |
| isLoading in useQuery | isPending | TanStack Query v5 (2024) | Semantic clarity |
| Custom progress bar | shadcn Progress | shadcn adoption | Accessible, animated |
| Manual toast management | sonner | 2023+ | Auto-dismiss, stacking |

**Deprecated/outdated:**
- `cacheTime` option: Renamed to `gcTime` in TanStack Query v5
- `isLoading` for initial load: Use `isPending` in v5
- Manual cleanup with useEffect for intervals: TanStack Query handles cleanup

## Open Questions

Things that couldn't be fully resolved:

1. **Cancel functionality (CONTEXT.md requirement)**
   - What we know: CONTEXT.md specifies "provide cancel button on running jobs"
   - What's unclear: Backend has no cancel endpoint currently
   - Investigation: Celery supports `revoke(task_id)` but no FastAPI endpoint exists
   - Recommendation: Either (a) add backend endpoint `/ingestion/cancel/{job_id}` or (b) defer cancel feature to future phase. Planner should clarify with user.

2. **Retry functionality (CONTEXT.md requirement)**
   - What we know: CONTEXT.md specifies "retry button on failed jobs (one-click restart with same config)"
   - What's unclear: Backend doesn't return original config in status response
   - Recommendation: Track original config client-side in localStorage or state when job starts

3. **Job history limit**
   - What we know: `/ingestion/jobs` returns active jobs only (from Redis)
   - What's unclear: No endpoint for historical completed/failed jobs
   - Recommendation: For MVP, show only active jobs from `/ingestion/jobs`. Jobs disappear from Redis after 1 hour (TTL). Consider this acceptable for now.

4. **Empty folder validation**
   - What we know: Backend returns `{ "message": "No files found" }` but completes successfully
   - What's unclear: Should frontend prevent submission or let backend handle?
   - Recommendation: Frontend should check `folder.file_count > 0` before allowing submit (per CONTEXT.md "prevent submission, show warning")

## Sources

### Primary (HIGH confidence)
- [TanStack Query useQuery docs](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery) - refetchInterval as function
- [shadcn/ui Progress](https://ui.shadcn.com/docs/components/progress) - Progress component API
- [shadcn/ui Badge](https://ui.shadcn.com/docs/components/badge) - Badge variants
- Existing codebase patterns (useRetrieve, RetrievalPage, ChatPage)
- Backend schemas (`src/distributed_task/schemas.py`) - TaskProgress structure
- Backend routes (`src/posts/router.py`) - API endpoint contracts

### Secondary (MEDIUM confidence)
- [TanStack Query Mastering Polling](https://medium.com/@soodakriti45/tanstack-query-mastering-polling-ee11dc3625cb) - Polling patterns
- [Real Time Polling in React Query 2025](https://samwithcode.in/tutorial/react-js/real-time-polling-in-react-query-2025) - Best practices
- [GitHub Discussion on conditional polling](https://github.com/TanStack/query/discussions/713) - Community patterns

### Tertiary (LOW confidence)
- Celery revoke documentation - For potential cancel feature (not yet in backend)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components from shadcn/ui, patterns from prior phases
- Architecture: HIGH - Consistent with existing Retrieval/Chat implementations
- Polling patterns: HIGH - TanStack Query official docs
- Cancel/Retry: LOW - Backend doesn't support, flagged as open questions

**Research date:** 2026-01-29
**Valid until:** 2026-03-01 (stable ecosystem, 30-day validity)
