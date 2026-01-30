# Phase 5: Evaluation - Research

**Researched:** 2026-01-29
**Domain:** React evaluation UI with TanStack Query, shadcn/ui forms, metrics display, and comparison table
**Confidence:** HIGH

## Summary

This phase implements an evaluation interface for testing retrieval system performance. Users can configure evaluation parameters (folder, top-k, enhancer, reranking, questions per doc), start evaluations, view results with metrics (hit rate, MRR, avg score), and compare multiple evaluations side by side. The existing codebase provides all necessary infrastructure: React 19, TanStack Query v5, shadcn/ui components, typed API client, and complete backend endpoints (`POST /evaluation/start`, `GET /evaluations`, `GET /evaluation/{id}`).

The key difference from Ingestion (Phase 4) is that evaluation runs synchronously on the backend (no Celery), so the POST request returns when complete. Additionally, evaluations support question reuse via `source_evaluation_id` or `question_group_id` parameters, enabling fair comparisons across different retrieval configurations. The comparison feature requires fetching multiple evaluations and displaying them in a unified table.

**Primary recommendation:** Use `useMutation` for starting evaluations (runs synchronously), `useQuery` for fetching evaluation lists and individual results, and a comparison table that accepts multiple evaluation IDs selected via checkboxes. Reuse existing patterns from Ingestion (FolderSelect, Slider, Checkbox) and Retrieval (form layout).

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-query | ^5.90.20 | Server state, mutations | useMutation for sync evaluation, useQuery for results |
| React | ^19.2.0 | UI framework | Already in project |
| Tailwind CSS | ^4.1.18 | Styling | Already configured |
| shadcn/ui | latest | UI components | Already configured, provides accessible components |
| lucide-react | ^0.563.0 | Icons | Already installed |
| sonner | ^2.0.7 | Toast notifications | Already installed |

### Supporting (Already Installed via shadcn)
| Component | Purpose | When to Use |
|-----------|---------|-------------|
| card | Section containers | Form card, results card, comparison card |
| select | Dropdowns | Folder select, reuse evaluation select |
| slider | Numeric inputs | Top-K slider, questions per doc slider |
| checkbox | Toggles | Query enhancer, reranking, evaluation selection |
| table | Data display | Results table, comparison table |
| badge | Status indicators | Evaluation status badges |
| progress | Visual feedback | Potentially for running state (though sync) |
| skeleton | Loading states | Results loading |
| label | Form labels | All form fields |

**Installation:** No additional components needed. All required UI components are already installed.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useMutation (sync) | useQuery with polling | Backend runs sync, mutation is cleaner |
| Checkbox multi-select | Select with multi | Checkboxes better for small N comparison |
| Side-by-side table | Charts | Tables show exact metrics, charts add complexity |

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/features/evaluation/
├── EvaluationPage.tsx           # Main page component
├── components/
│   ├── EvaluationForm.tsx       # Folder, top-k, toggles, questions, start button
│   ├── EvaluationStatusBadge.tsx # Colored status badge (pending/running/completed/failed)
│   ├── ResultsDisplay.tsx       # Metrics display for single evaluation
│   ├── EvaluationSelect.tsx     # Dropdown to select completed evaluation
│   ├── ComparisonTable.tsx      # Side-by-side comparison of multiple evaluations
│   ├── ReuseQuestionsSelect.tsx # Dropdown for source_evaluation_id
│   └── EvaluationsSkeleton.tsx  # Loading skeleton for results
├── hooks/
│   ├── useStartEvaluation.ts    # Mutation for POST /evaluation/start
│   ├── useEvaluations.ts        # Query for GET /evaluations
│   ├── useEvaluation.ts         # Query for GET /evaluation/{id}
│   └── useFolders.ts            # Reuse from ingestion OR import shared
└── types.ts                     # Local type definitions (if needed)
```

### Pattern 1: Synchronous Mutation for Evaluation Start
**What:** Use `useMutation` for the POST `/evaluation/start` endpoint which runs synchronously
**When to use:** Starting new evaluations (backend blocks until complete)
**Example:**
```typescript
// frontend/src/features/evaluation/hooks/useStartEvaluation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { EvaluationRequest, EvaluationStartResponse } from '@/types/api'

export function useStartEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: EvaluationRequest) => {
      return apiClient<EvaluationStartResponse>('/evaluation/start', {
        method: 'POST',
        body: request,
      })
    },
    onSuccess: () => {
      // Refresh evaluations list
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    },
  })
}
```

### Pattern 2: useQuery for Evaluations List
**What:** Fetch all evaluations for dropdown selection and comparison
**When to use:** Populating results dropdown, comparison checkboxes
**Example:**
```typescript
// frontend/src/features/evaluation/hooks/useEvaluations.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { EvaluationsListResponse } from '@/types/api'

export function useEvaluations(limit: number = 50) {
  return useQuery({
    queryKey: ['evaluations', limit],
    queryFn: () => apiClient<EvaluationsListResponse>(`/evaluations?limit=${limit}`),
  })
}
```

### Pattern 3: Results Display with Metrics Cards
**What:** Display hit_rate, MRR, avg_score as prominent metrics
**When to use:** Showing results for a selected evaluation
**Example:**
```typescript
// ResultsDisplay.tsx - metrics display
import type { EvaluationResultsSummary } from '@/types/api'

interface MetricCardProps {
  label: string
  value: number | undefined
  format?: 'percent' | 'decimal'
}

function MetricCard({ label, value, format = 'percent' }: MetricCardProps) {
  const displayValue = value !== undefined
    ? format === 'percent'
      ? `${(value * 100).toFixed(1)}%`
      : value.toFixed(3)
    : 'N/A'

  return (
    <div className="rounded-lg border p-4 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{displayValue}</p>
    </div>
  )
}

export function ResultsDisplay({ results }: { results: EvaluationResultsSummary }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard label="Hit Rate" value={results.hit_rate} format="percent" />
      <MetricCard label="MRR" value={results.mrr} format="decimal" />
      <MetricCard label="Avg Score" value={results.avg_score} format="decimal" />
    </div>
  )
}
```

### Pattern 4: Comparison Table
**What:** Side-by-side table showing multiple evaluations with their configs and metrics
**When to use:** EVAL-12 comparison feature
**Example:**
```typescript
// ComparisonTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { EvaluationStatusResponse } from '@/types/api'

interface ComparisonTableProps {
  evaluations: EvaluationStatusResponse[]
}

export function ComparisonTable({ evaluations }: ComparisonTableProps) {
  if (evaluations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Select evaluations to compare
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Evaluation ID</TableHead>
          <TableHead>Top-K</TableHead>
          <TableHead>Enhancer</TableHead>
          <TableHead>Reranking</TableHead>
          <TableHead>Hit Rate</TableHead>
          <TableHead>MRR</TableHead>
          <TableHead>Avg Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluations.map((eval) => (
          <TableRow key={eval.evaluation_id}>
            <TableCell className="font-mono text-xs">
              {eval.evaluation_id.slice(0, 8)}...
            </TableCell>
            <TableCell>{eval.retrieve_params.top_k}</TableCell>
            <TableCell>{eval.retrieve_params.use_query_enhancer ? 'Yes' : 'No'}</TableCell>
            <TableCell>{eval.retrieve_params.use_reranking ? 'Yes' : 'No'}</TableCell>
            <TableCell>
              {eval.results_summary?.hit_rate !== undefined
                ? `${(eval.results_summary.hit_rate * 100).toFixed(1)}%`
                : 'N/A'}
            </TableCell>
            <TableCell>
              {eval.results_summary?.mrr !== undefined
                ? eval.results_summary.mrr.toFixed(3)
                : 'N/A'}
            </TableCell>
            <TableCell>
              {eval.results_summary?.avg_score !== undefined
                ? eval.results_summary.avg_score.toFixed(3)
                : 'N/A'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Pattern 5: Reuse Questions Select (EVAL-06)
**What:** Dropdown to select a previous evaluation for question reuse
**When to use:** When user wants to compare different retrieval configs with same questions
**Example:**
```typescript
// ReuseQuestionsSelect.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EvaluationStatusResponse } from '@/types/api'

interface ReuseQuestionsSelectProps {
  value: string | undefined
  onChange: (value: string | undefined) => void
  evaluations: EvaluationStatusResponse[]
  disabled?: boolean
}

export function ReuseQuestionsSelect({
  value,
  onChange,
  evaluations,
  disabled,
}: ReuseQuestionsSelectProps) {
  // Only show completed evaluations
  const completedEvaluations = evaluations.filter(e => e.status === 'completed')

  return (
    <Select
      value={value ?? 'none'}
      onValueChange={(v) => onChange(v === 'none' ? undefined : v)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Generate new questions" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Generate new questions</SelectItem>
        {completedEvaluations.map((eval) => (
          <SelectItem key={eval.evaluation_id} value={eval.evaluation_id}>
            {eval.evaluation_id.slice(0, 8)}... ({eval.folder_path})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### Pattern 6: Status Badge with Evaluation States
**What:** Colored badges for evaluation status per established patterns
**When to use:** Results dropdown, comparison table
**Example:**
```typescript
// EvaluationStatusBadge.tsx
import { Badge } from '@/components/ui/badge'

type EvaluationStatus = 'pending' | 'running' | 'completed' | 'failed'

const statusConfig: Record<EvaluationStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  pending: { variant: 'outline', label: 'Pending' },
  running: { variant: 'default', label: 'Running' },
  completed: { variant: 'secondary', label: 'Completed' },
  failed: { variant: 'destructive', label: 'Failed' },
}

export function EvaluationStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as EvaluationStatus] ?? { variant: 'outline', label: status }

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

### Anti-Patterns to Avoid
- **Polling for evaluation status:** Backend runs synchronously, no need for polling
- **Multiple queries for comparison:** Fetch evaluations list once, filter client-side
- **Complex state for comparison selection:** Simple `Set<string>` of selected evaluation IDs
- **Hardcoding folder paths:** Reuse FolderSelect from ingestion (or shared)
- **Separate pages for results and comparison:** Single page with tabs/sections is cleaner

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Folder dropdown | Custom dropdown | Reuse FolderSelect from ingestion | DRY, consistent behavior |
| Status badges | Custom span with colors | EvaluationStatusBadge (copy pattern from JobStatusBadge) | Consistent styling |
| Metrics display | Custom divs | Metric cards with consistent formatting | Reusable pattern |
| Multi-select for comparison | Custom checkbox state | Simple `Set<string>` with checkboxes | Clean, minimal state |
| Percent formatting | Manual string concat | `${(value * 100).toFixed(1)}%` helper | Consistent precision |

**Key insight:** The evaluation UI closely mirrors ingestion (form + results), with the addition of comparison. Reuse patterns heavily from Phase 4.

## Common Pitfalls

### Pitfall 1: Long-Running Mutation Without Feedback
**What goes wrong:** User thinks UI is broken during evaluation (can take minutes)
**Why it happens:** Evaluation runs synchronously, mutation blocks
**How to avoid:** Show loading spinner with "Evaluating..." text, disable form, potentially show estimated time based on num_questions_per_doc
**Warning signs:** User clicks button multiple times, no visual feedback

### Pitfall 2: Forgetting to Pass source_evaluation_id for Question Reuse
**What goes wrong:** New questions generated when user expected reuse
**Why it happens:** Not sending source_evaluation_id in request
**How to avoid:** EvaluationForm must include ReuseQuestionsSelect and map to request body
**Warning signs:** New question_group_id returned, evaluation takes longer than expected

### Pitfall 3: Comparison Table With Mismatched Question Groups
**What goes wrong:** Comparing evaluations with different questions is misleading
**Why it happens:** User selects evaluations from different question_group_ids
**How to avoid:** Group evaluations by question_group_id in UI, or warn when comparing different groups
**Warning signs:** Hit rates vary wildly between configurations

### Pitfall 4: Missing Configuration Display (EVAL-11)
**What goes wrong:** User can't remember what configuration was used
**Why it happens:** Only showing metrics without retrieve_params
**How to avoid:** Always display top_k, use_query_enhancer, use_reranking alongside results
**Warning signs:** User opens multiple tabs to compare, confusion

### Pitfall 5: Stale Evaluations List After Starting New
**What goes wrong:** New evaluation doesn't appear in dropdown
**Why it happens:** Not invalidating query cache after mutation
**How to avoid:** Call `queryClient.invalidateQueries({ queryKey: ['evaluations'] })` in onSuccess
**Warning signs:** User has to refresh page to see new evaluation

### Pitfall 6: No Loading State During Evaluation
**What goes wrong:** User doesn't know evaluation is running
**Why it happens:** useMutation.isPending not shown in UI
**How to avoid:** Per EVAL-13, show loading state with spinner when isPending is true
**Warning signs:** Button appears clickable but nothing happens

## Code Examples

### Complete EvaluationForm Component
```typescript
// frontend/src/features/evaluation/components/EvaluationForm.tsx
import { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { FolderSelect } from '@/features/ingestion/components/FolderSelect'
import { ReuseQuestionsSelect } from './ReuseQuestionsSelect'
import type { EvaluationRequest, EvaluationStatusResponse } from '@/types/api'

interface EvaluationFormProps {
  onSubmit: (request: EvaluationRequest) => void
  isPending: boolean
  evaluations: EvaluationStatusResponse[]
}

export function EvaluationForm({ onSubmit, isPending, evaluations }: EvaluationFormProps) {
  const [folderPath, setFolderPath] = useState('')
  const [topK, setTopK] = useState(10)
  const [useQueryEnhancer, setUseQueryEnhancer] = useState(false)
  const [useReranking, setUseReranking] = useState(false)
  const [numQuestionsPerDoc, setNumQuestionsPerDoc] = useState(1)
  const [sourceEvaluationId, setSourceEvaluationId] = useState<string | undefined>()

  const canSubmit = folderPath && !isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    onSubmit({
      folder_path: folderPath,
      top_k: topK,
      use_query_enhancer: useQueryEnhancer,
      use_reranking: useReranking,
      num_questions_per_doc: numQuestionsPerDoc,
      source_evaluation_id: sourceEvaluationId ?? null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Folder Selection - EVAL-01 */}
      <div className="space-y-2">
        <Label>Evaluation Dataset Folder</Label>
        <FolderSelect
          value={folderPath}
          onChange={setFolderPath}
          disabled={isPending}
        />
      </div>

      {/* Parameter Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top-K Slider - EVAL-02 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Top K Results</Label>
            <span className="text-sm text-muted-foreground">{topK}</span>
          </div>
          <Slider
            min={1}
            max={50}
            step={1}
            value={[topK]}
            onValueChange={([value]) => setTopK(value)}
            disabled={isPending}
          />
        </div>

        {/* Questions Per Doc Slider - EVAL-05 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Questions Per Document</Label>
            <span className="text-sm text-muted-foreground">{numQuestionsPerDoc}</span>
          </div>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[numQuestionsPerDoc]}
            onValueChange={([value]) => setNumQuestionsPerDoc(value)}
            disabled={isPending || !!sourceEvaluationId}
          />
          {sourceEvaluationId && (
            <p className="text-xs text-muted-foreground">
              Disabled when reusing questions
            </p>
          )}
        </div>
      </div>

      {/* Toggle Checkboxes - EVAL-03, EVAL-04 */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="query-enhancer"
            checked={useQueryEnhancer}
            onCheckedChange={(checked) => setUseQueryEnhancer(checked === true)}
            disabled={isPending}
          />
          <Label htmlFor="query-enhancer" className="cursor-pointer">
            Enable Query Enhancer
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="reranking"
            checked={useReranking}
            onCheckedChange={(checked) => setUseReranking(checked === true)}
            disabled={isPending}
          />
          <Label htmlFor="reranking" className="cursor-pointer">
            Enable Reranking
          </Label>
        </div>
      </div>

      {/* Reuse Questions - EVAL-06 */}
      <div className="space-y-2">
        <Label>Reuse Questions From</Label>
        <ReuseQuestionsSelect
          value={sourceEvaluationId}
          onChange={setSourceEvaluationId}
          evaluations={evaluations}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Reuse questions from a previous evaluation for fair comparison
        </p>
      </div>

      {/* Submit Button - EVAL-07 */}
      <Button type="submit" disabled={!canSubmit}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Evaluating...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Start Evaluation
          </>
        )}
      </Button>
    </form>
  )
}
```

### Complete useEvaluation Hook
```typescript
// frontend/src/features/evaluation/hooks/useEvaluation.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { EvaluationStatusResponse } from '@/types/api'

export function useEvaluation(evaluationId: string | null) {
  return useQuery({
    queryKey: ['evaluation', evaluationId],
    queryFn: () => apiClient<EvaluationStatusResponse>(`/evaluation/${evaluationId}`),
    enabled: !!evaluationId,
  })
}
```

### Main Page Layout Example
```typescript
// EvaluationPage.tsx structure (high-level)
export function EvaluationPage() {
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null)
  const [comparisonIds, setComparisonIds] = useState<Set<string>>(new Set())

  const { mutate: startEvaluation, isPending } = useStartEvaluation()
  const { data: evaluationsData } = useEvaluations()
  const evaluations = evaluationsData?.evaluations ?? []

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold">Evaluation</h2>
          <p className="text-muted-foreground">
            Test retrieval system performance
          </p>
        </div>

        {/* Evaluation Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Start Evaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <EvaluationForm
              onSubmit={startEvaluation}
              isPending={isPending}
              evaluations={evaluations}
            />
          </CardContent>
        </Card>

        {/* Results Card - EVAL-09, EVAL-10, EVAL-11 */}
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <EvaluationSelect
              value={selectedEvaluationId}
              onChange={setSelectedEvaluationId}
              evaluations={evaluations}
            />
            {selectedEvaluationId && (
              <ResultsDisplay evaluationId={selectedEvaluationId} />
            )}
          </CardContent>
        </Card>

        {/* Comparison Card - EVAL-12 */}
        <Card>
          <CardHeader>
            <CardTitle>Compare Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <ComparisonSelector
              evaluations={evaluations}
              selected={comparisonIds}
              onSelectionChange={setComparisonIds}
            />
            <ComparisonTable
              evaluations={evaluations.filter(e => comparisonIds.has(e.evaluation_id))}
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
```

## Backend API Reference

### POST /evaluation/start
**Request:**
```typescript
{
  folder_path: string        // Required - path to evaluation folder
  top_k?: number            // Default: 10
  use_query_enhancer?: boolean  // Default: false
  use_reranking?: boolean   // Default: false
  num_questions_per_doc?: number  // Default: 1
  source_evaluation_id?: string | null  // Optional - reuse questions
  question_group_id?: string | null     // Optional - reuse questions (mutually exclusive)
}
```

**Response:**
```typescript
{
  evaluation_id: string
  question_group_id: string
  status: string         // "completed" or "failed"
  message: string
  reused_questions: boolean
}
```

**Note:** This endpoint runs SYNCHRONOUSLY. The request blocks until evaluation completes.

### GET /evaluations
**Query params:** `limit` (default: 50)

**Response:**
```typescript
{
  evaluations: EvaluationStatusResponse[]
  total: number
}
```

### GET /evaluation/{evaluation_id}
**Response:**
```typescript
{
  evaluation_id: string
  question_group_id: string
  status: string          // "pending" | "running" | "completed" | "failed"
  folder_path: string
  retrieve_params: {
    top_k: number
    use_query_enhancer: boolean
    use_reranking: boolean
  }
  num_documents_processed: number
  created_at: string      // ISO datetime
  completed_at?: string   // ISO datetime
  results_summary?: {
    hit_rate?: number     // 0.0 to 1.0
    mrr?: number          // Mean Reciprocal Rank
    avg_score?: number    // Average retrieval score
    total_questions?: number
  }
  error_message?: string
  related_evaluation_ids: string[]  // Others with same question_group_id
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate question generation | Reusable question_group_id | Current design | Fair comparison of configs |
| Manual results calculation | results_summary in response | Current design | Server-computed metrics |
| Individual evaluation fetch | List endpoint with filtering | Current design | Single query for comparison |

**Deprecated/outdated:**
- `QuestionAnswerDocument` model: Replaced by `QuestionDocument` + `EvaluationResultDocument` for question reuse

## Open Questions

Things that couldn't be fully resolved:

1. **FolderSelect import path**
   - What we know: FolderSelect exists in `features/ingestion/components/FolderSelect.tsx`
   - What's unclear: Should we create shared component or import cross-feature?
   - Recommendation: Import from ingestion for now (`@/features/ingestion/components/FolderSelect`), refactor to shared later if needed

2. **Comparison group validation**
   - What we know: Evaluations have `question_group_id` and `related_evaluation_ids`
   - What's unclear: Should comparison only allow same question_group_id?
   - Recommendation: Allow any comparison, but show visual indicator when question_group_ids differ (warning badge)

3. **Evaluation timeout**
   - What we know: Evaluation runs synchronously, can take minutes
   - What's unclear: What happens if evaluation takes very long (>2 min)?
   - Recommendation: Show "This may take a few minutes" message when isPending. Consider backend timeout handling in future.

## Sources

### Primary (HIGH confidence)
- Backend router (`src/posts/router.py` lines 381-537) - Evaluation endpoint contracts
- Backend schemas (`src/evaluation/schemas.py`) - Request/response types
- Backend models (`src/evaluation/models.py`) - Data model structure
- Existing frontend types (`frontend/src/types/api.ts` lines 120-164) - TypeScript types already defined
- Existing ingestion patterns (`frontend/src/features/ingestion/`) - Form, hooks, components
- Existing retrieval patterns (`frontend/src/features/retrieval/`) - Form layout

### Secondary (MEDIUM confidence)
- Phase 4 research (`04-RESEARCH.md`) - Polling patterns, badge patterns (though polling not needed here)
- STATE.md decisions - Form control patterns, slider patterns, checkbox patterns

### Tertiary (LOW confidence)
- None - all patterns verified against existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components already in codebase, patterns established
- Architecture: HIGH - Mirrors ingestion/retrieval patterns, API contracts verified
- Form patterns: HIGH - Direct reuse of existing patterns
- Comparison feature: MEDIUM - New feature, but follows table patterns

**Research date:** 2026-01-29
**Valid until:** 2026-03-01 (stable ecosystem, backend API stable)
