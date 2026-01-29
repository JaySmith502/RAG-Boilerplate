# Phase 3: Retrieval Testing - Research

**Researched:** 2026-01-29
**Domain:** React form controls with TanStack Query mutations, shadcn/ui tables with expandable rows
**Confidence:** HIGH

## Summary

This phase implements a retrieval testing interface for the RAG document Q&A system. The UI requires a query form with parameter controls (text input, slider, checkboxes, dropdown), a results table with expandable rows, and loading/error states. The existing codebase provides a solid foundation: React 19, TanStack Query v5, Tailwind CSS v4, shadcn/ui components, a typed API client, and full TypeScript types for the `/retrieve` endpoint.

The implementation uses shadcn/ui form components (Input, Slider, Checkbox, Select, Label) for parameter controls, the Table component for results display, and Collapsible for expandable row content. The `useMutation` hook from TanStack Query handles the retrieval request since `/retrieve` is a POST endpoint (not a query that should be cached).

**Primary recommendation:** Use a controlled form state pattern with `useState` for all parameters, `useMutation` for the retrieval API call, Table + Collapsible for expandable results, and Skeleton for loading states. Keep the form simple without react-hook-form since there are no validation requirements.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-query | ^5.90.20 | Server state / mutations | Already configured, handles loading/error states |
| React | ^19.2.0 | UI framework | Already in project |
| Tailwind CSS | ^4.1.18 | Styling | Already configured |
| shadcn/ui | latest | UI components | Already configured, accessible components |
| lucide-react | ^0.563.0 | Icons | Already installed |

### Supporting (To Install via shadcn)
| Component | Purpose | When to Use |
|-----------|---------|-------------|
| table | Results display | Main retrieval results |
| slider | Top-K control | Numeric range selection |
| checkbox | Toggle controls | Query enhancer, reranking toggles |
| select | Pipeline dropdown | Fixed option selection |
| label | Form field labels | Associate labels with controls |

**Installation:**
```bash
cd frontend
pnpm dlx shadcn@latest add table slider checkbox select label
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Simple useState form | react-hook-form | Overkill for 5 simple controls with no validation |
| useMutation | useQuery with refetch | POST requests should use mutation pattern |
| Table + Collapsible | TanStack Table | TanStack Table overkill for simple display without sorting/pagination |
| Collapsible rows | Separate detail panel | Inline expansion is more intuitive for inspecting results |

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/features/retrieval/
├── RetrievalPage.tsx          # Main page component with form + results
├── components/
│   ├── RetrievalForm.tsx      # Parameter form controls
│   ├── ResultsTable.tsx       # Results table with expandable rows
│   ├── ResultRow.tsx          # Individual result row with expansion
│   └── ResultsSkeleton.tsx    # Loading skeleton for table
├── hooks/
│   └── useRetrieve.ts         # Retrieval mutation hook
└── types.ts                   # Local type definitions (if needed)
```

### Pattern 1: useMutation for POST Retrieval
**What:** Use `useMutation` instead of `useQuery` for the `/retrieve` endpoint
**When to use:** POST endpoints that perform server-side work and return results
**Why:** The `/retrieve` endpoint is a POST that may trigger query enhancement and reranking (expensive operations). Using mutation makes the "explicit trigger" UX clear.
**Example:**
```typescript
// frontend/src/features/retrieval/hooks/useRetrieve.ts
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { RetrievalRequest, RetrievalResponse } from '@/types/api'

export function useRetrieve() {
  return useMutation({
    mutationFn: async (request: RetrievalRequest) => {
      return apiClient<RetrievalResponse>('/retrieve', {
        method: 'POST',
        body: request,
      })
    },
  })
}
```

### Pattern 2: Controlled Form State with useState
**What:** Manage all form parameters with individual useState hooks
**When to use:** Simple forms with few fields and no complex validation
**Why:** No need for react-hook-form overhead when just managing 5 controlled inputs
**Example:**
```typescript
// RetrievalForm state pattern
const [query, setQuery] = useState('')
const [topK, setTopK] = useState(10)
const [useQueryEnhancer, setUseQueryEnhancer] = useState(false)
const [useReranking, setUseReranking] = useState(false)
const [pipelineType, setPipelineType] = useState<PipelineType>('recursive_overlap')

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  if (!query.trim()) return

  retrieve({
    query: query.trim(),
    top_k: topK,
    use_query_enhancer: useQueryEnhancer,
    use_reranking: useReranking,
    pipeline_type: pipelineType,
  })
}
```

### Pattern 3: Table with Collapsible Rows
**What:** Use Collapsible component wrapped around TableRow for expandable content
**When to use:** Displaying tabular data where rows need to expand to show more detail
**Why:** Clean UX for inspecting full document text without leaving table context
**Example:**
```typescript
// Source: DEV.to tutorial - 2 component pattern
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

function ResultRow({ document, index }: { document: RetrievedDocument; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <>
        <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setIsOpen(!isOpen)}>
          <TableCell className="w-12">{index + 1}</TableCell>
          <TableCell className="font-medium truncate max-w-md">
            {document.text.slice(0, 100)}...
          </TableCell>
          <TableCell className="truncate max-w-32">{document.source}</TableCell>
          <TableCell className="text-right">
            {document.score?.toFixed(4) ?? 'N/A'}
          </TableCell>
          <TableCell className="w-10">
            <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <TableRow>
            <TableCell colSpan={5} className="bg-muted/30 p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Full Text:</p>
                <p className="text-sm whitespace-pre-wrap">{document.text}</p>
                {Object.keys(document.metadata).length > 0 && (
                  <>
                    <p className="text-sm font-medium mt-4">Metadata:</p>
                    <pre className="text-xs bg-muted p-2 rounded">
                      {JSON.stringify(document.metadata, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  )
}
```

### Pattern 4: Skeleton Table for Loading State
**What:** Show table structure with skeleton cells during loading
**When to use:** While retrieval is in progress
**Example:**
```typescript
// ResultsSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function ResultsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Text Preview</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="text-right">Score</TableHead>
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-6" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full max-w-md" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Pattern 5: Slider with Value Display
**What:** Show current slider value alongside the slider control
**When to use:** Numeric controls where the exact value matters
**Example:**
```typescript
// Slider with label showing value
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <Label htmlFor="top-k">Top K Results</Label>
    <span className="text-sm text-muted-foreground">{topK}</span>
  </div>
  <Slider
    id="top-k"
    min={1}
    max={50}
    step={1}
    value={[topK]}
    onValueChange={([value]) => setTopK(value)}
  />
</div>
```

### Anti-Patterns to Avoid
- **useQuery for POST endpoints:** The `/retrieve` endpoint is POST and performs expensive operations. Use `useMutation` for explicit trigger.
- **Caching retrieval results:** Different parameter combinations create different results. Don't cache with query keys.
- **Complex form library for simple forms:** react-hook-form adds overhead when you have 5 simple controlled inputs with no validation.
- **Inline table state management:** Extract row expansion state to the row component to avoid re-rendering entire table.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slider control | Custom range input styling | shadcn Slider | Accessible, keyboard support, styled |
| Dropdown select | Custom dropdown | shadcn Select | Portal positioning, keyboard nav, focus trap |
| Expandable rows | Manual state + CSS | Collapsible component | Animation, accessibility, managed state |
| Loading skeleton | Custom animated divs | shadcn Skeleton | Consistent pulse animation, proper bg color |
| Checkbox with label | Raw checkbox + text | shadcn Checkbox + Label | Proper htmlFor association, hit area |

**Key insight:** shadcn/ui form components handle accessibility (ARIA attributes, keyboard navigation, focus management) and edge cases that custom implementations often miss. Always prefer the shadcn component.

## Common Pitfalls

### Pitfall 1: Using useQuery Instead of useMutation for POST
**What goes wrong:** Retrieval fires on mount, caches incorrectly, or fires multiple times
**Why it happens:** Developers assume all data fetching should use useQuery
**How to avoid:** Use `useMutation` for POST endpoints, especially ones that perform server-side work
**Warning signs:** Retrieval fires without clicking button, stale results shown

### Pitfall 2: Slider Value as Single Number
**What goes wrong:** Slider doesn't update or shows wrong value
**Why it happens:** shadcn Slider uses `value={[number]}` array format, not single number
**How to avoid:** Always pass `value={[topK]}` and destructure in `onValueChange={([value]) => setTopK(value)}`
**Warning signs:** TypeScript error, slider stuck at position

### Pitfall 3: Collapsible asChild Without Fragment
**What goes wrong:** Invalid DOM nesting, React warnings, broken expansion
**Why it happens:** Collapsible needs to wrap multiple elements (row + content)
**How to avoid:** Wrap TableRow and CollapsibleContent in `<>...</>` fragment, use `asChild` on Collapsible
**Warning signs:** Console warnings about invalid nesting

### Pitfall 4: Empty Query Submission
**What goes wrong:** API error or meaningless results
**Why it happens:** User clicks retrieve with empty input
**How to avoid:** Disable button when query is empty, validate before calling `mutate`
**Warning signs:** Network errors, empty results

### Pitfall 5: Long Text Overflow in Table Cells
**What goes wrong:** Table layout breaks, horizontal scroll, unreadable
**Why it happens:** Document text can be very long
**How to avoid:** Use `truncate max-w-[value]` on preview cells, show full text only in expanded row
**Warning signs:** Wide table, text running off screen

### Pitfall 6: Score Display for Null Values
**What goes wrong:** "null" or error displayed for score
**Why it happens:** Score can be null when reranking not used
**How to avoid:** Use `score?.toFixed(4) ?? 'N/A'` for safe display
**Warning signs:** "null" or "undefined" in score column

## Code Examples

### Complete RetrievalForm Component
```typescript
// frontend/src/features/retrieval/components/RetrievalForm.tsx
import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PipelineType, RetrievalRequest } from '@/types/api'

interface RetrievalFormProps {
  onSubmit: (request: RetrievalRequest) => void
  isPending: boolean
}

export function RetrievalForm({ onSubmit, isPending }: RetrievalFormProps) {
  const [query, setQuery] = useState('')
  const [topK, setTopK] = useState(10)
  const [useQueryEnhancer, setUseQueryEnhancer] = useState(false)
  const [useReranking, setUseReranking] = useState(false)
  const [pipelineType, setPipelineType] = useState<PipelineType>('recursive_overlap')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    onSubmit({
      query: query.trim(),
      top_k: topK,
      use_query_enhancer: useQueryEnhancer,
      use_reranking: useReranking,
      pipeline_type: pipelineType,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Query Input */}
      <div className="space-y-2">
        <Label htmlFor="query">Search Query</Label>
        <Input
          id="query"
          placeholder="Enter your search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isPending}
        />
      </div>

      {/* Parameter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top-K Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="top-k">Top K Results</Label>
            <span className="text-sm text-muted-foreground">{topK}</span>
          </div>
          <Slider
            id="top-k"
            min={1}
            max={50}
            step={1}
            value={[topK]}
            onValueChange={([value]) => setTopK(value)}
            disabled={isPending}
          />
        </div>

        {/* Pipeline Select */}
        <div className="space-y-2">
          <Label htmlFor="pipeline">Pipeline Type</Label>
          <Select
            value={pipelineType}
            onValueChange={(value) => setPipelineType(value as PipelineType)}
            disabled={isPending}
          >
            <SelectTrigger id="pipeline">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recursive_overlap">Recursive Overlap</SelectItem>
              <SelectItem value="semantic">Semantic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Toggle Checkboxes */}
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

      {/* Submit Button */}
      <Button type="submit" disabled={isPending || !query.trim()}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Retrieving...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Retrieve
          </>
        )}
      </Button>
    </form>
  )
}
```

### Error State with Retry
```typescript
// Error display pattern (consistent with ChatPage)
{isError && (
  <div className="border border-destructive/50 bg-destructive/10 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <p className="text-sm text-destructive">
        Failed to retrieve: {error instanceof Error ? error.message : 'Unknown error'}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => mutate(lastRequest)}
        className="border-destructive/50 text-destructive hover:bg-destructive/10"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Retry
      </Button>
    </div>
  </div>
)}
```

### Empty Results State
```typescript
// When query returns no results
{data && data.documents.length === 0 && (
  <div className="text-center py-12 text-muted-foreground">
    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
    <p className="text-lg font-medium">No results found</p>
    <p className="text-sm">Try adjusting your query or parameters</p>
  </div>
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| isLoading in useMutation | isPending | TanStack Query v5 (2024) | Semantic clarity |
| react-hook-form for all forms | Simple useState for simple forms | Best practice | Reduced complexity |
| Custom expandable rows | Collapsible + asChild | shadcn pattern | Cleaner implementation |
| Manual error handling | Mutation error states | TanStack Query pattern | Automatic error/success tracking |

**Deprecated/outdated:**
- `isLoading` in useMutation: Use `isPending` in TanStack Query v5
- Custom accordion for table expansion: Use Collapsible with `asChild` pattern

## Open Questions

Things that couldn't be fully resolved:

1. **Result persistence between queries**
   - What we know: Current pattern clears results on new query
   - What's unclear: Should previous results persist while loading new?
   - Recommendation: Clear on new query start (simpler, clearer UX)

2. **Top-K maximum value**
   - What we know: UI typically allows 1-50, backend may have different limits
   - What's unclear: Backend maximum not specified in schemas
   - Recommendation: Use 50 as UI max, backend will validate

## Sources

### Primary (HIGH confidence)
- [shadcn/ui Table](https://ui.shadcn.com/docs/components/table) - Table component structure
- [shadcn/ui Slider](https://ui.shadcn.com/docs/components/slider) - Slider component API
- [shadcn/ui Select](https://ui.shadcn.com/docs/components/select) - Select component structure
- [shadcn/ui Checkbox](https://ui.shadcn.com/docs/components/checkbox) - Checkbox with labels
- [shadcn/ui Skeleton](https://ui.shadcn.com/docs/components/skeleton) - Loading skeleton
- [TanStack Query Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations) - useMutation pattern
- Existing codebase patterns (ChatPage, useSendMessage, api-client)

### Secondary (MEDIUM confidence)
- [DEV.to Expandable Table Tutorial](https://dev.to/mfts/build-an-expandable-data-table-with-2-shadcnui-components-4nge) - Collapsible + Table pattern
- [TanStack Table Skeleton Discussion](https://github.com/TanStack/table/discussions/2386) - Skeleton row pattern

### Tertiary (LOW confidence)
- None - all patterns verified with official sources or existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components from shadcn/ui official docs, TanStack Query patterns from prior phases
- Architecture: HIGH - Patterns consistent with existing ChatPage implementation
- Pitfalls: HIGH - Derived from component documentation and common React patterns

**Research date:** 2026-01-29
**Valid until:** 2026-03-01 (stable ecosystem, 30-day validity)
