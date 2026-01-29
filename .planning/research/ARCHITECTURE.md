# Architecture Patterns

**Domain:** React SaaS Dashboard (Document Q&A Frontend)
**Stack:** Vite + TypeScript + React + Tailwind CSS + shadcn/ui
**Researched:** 2026-01-29
**Confidence:** HIGH (established React patterns, well-documented ecosystem)

## Executive Summary

This architecture document defines the component structure, state management approach, and API integration patterns for a React frontend connecting to the existing FastAPI backend. The design prioritizes:

1. **Feature-based organization** over type-based (components/, hooks/, etc.)
2. **TanStack Query for server state** (API data caching, mutations)
3. **React Context for UI state** (sidebar open, theme, modal state)
4. **Type-safe API client** generated from backend schemas
5. **Collocated components** within features for maintainability

## Recommended Architecture

```
src/
├── app/                    # App shell and routing
│   ├── App.tsx            # Root component, providers
│   ├── router.tsx         # Route definitions
│   └── providers.tsx      # QueryClient, ThemeProvider
│
├── components/            # Shared UI components (shadcn/ui based)
│   ├── ui/               # shadcn/ui primitives (Button, Card, etc.)
│   ├── layout/           # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── PageLayout.tsx
│   └── common/           # Shared composite components
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── EmptyState.tsx
│
├── features/              # Feature modules (main application logic)
│   ├── chat/
│   │   ├── components/
│   │   │   ├── ChatPage.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── SessionList.tsx
│   │   │   └── SourcesList.tsx
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   └── useSessions.ts
│   │   ├── api.ts
│   │   └── types.ts
│   │
│   ├── retrieval/
│   │   ├── components/
│   │   │   ├── RetrievalPage.tsx
│   │   │   ├── QueryForm.tsx
│   │   │   ├── ResultsList.tsx
│   │   │   └── DocumentCard.tsx
│   │   ├── hooks/
│   │   │   └── useRetrieval.ts
│   │   ├── api.ts
│   │   └── types.ts
│   │
│   ├── ingestion/
│   │   ├── components/
│   │   │   ├── IngestionPage.tsx
│   │   │   ├── JobStartForm.tsx
│   │   │   ├── JobStatusCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── ActiveJobsList.tsx
│   │   ├── hooks/
│   │   │   ├── useIngestionJob.ts
│   │   │   └── useJobPolling.ts
│   │   ├── api.ts
│   │   └── types.ts
│   │
│   └── evaluation/
│       ├── components/
│       │   ├── EvaluationPage.tsx
│       │   ├── EvalStartForm.tsx
│       │   ├── EvalResultsCard.tsx
│       │   └── ComparisonTable.tsx
│       ├── hooks/
│       │   └── useEvaluation.ts
│       ├── api.ts
│       └── types.ts
│
├── lib/                   # Utilities and configuration
│   ├── api-client.ts     # Base fetch wrapper with error handling
│   ├── query-client.ts   # TanStack Query configuration
│   └── utils.ts          # General utilities (cn, formatters)
│
├── types/                 # Shared TypeScript types
│   ├── api.ts            # API request/response types (from backend schemas)
│   └── common.ts         # Common utility types
│
└── styles/
    └── globals.css       # Tailwind directives, CSS variables
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `App.tsx` | Provider wrapping, global error boundary | All features via context |
| `PageLayout` | Sidebar + header + content area shell | Individual feature pages |
| `ChatPage` | Chat feature orchestration | `useChat`, `useSessions` hooks |
| `RetrievalPage` | Retrieval testing orchestration | `useRetrieval` hook |
| `IngestionPage` | Ingestion job management | `useIngestionJob`, `useJobPolling` hooks |
| `EvaluationPage` | Evaluation orchestration | `useEvaluation` hook |
| `api-client.ts` | HTTP layer, error normalization | All feature api.ts files |

### Data Flow

```
User Action
    ↓
Feature Component (e.g., ChatPage)
    ↓
Custom Hook (e.g., useChat)
    ↓
TanStack Query (useMutation / useQuery)
    ↓
Feature API module (features/chat/api.ts)
    ↓
Base API Client (lib/api-client.ts)
    ↓
FastAPI Backend
    ↓
Response flows back up, TanStack Query caches it
    ↓
Component re-renders with new data
```

## State Management Architecture

### The Two-State Model

Modern React applications distinguish between two types of state:

| State Type | Description | Tool | Example |
|------------|-------------|------|---------|
| **Server State** | Data from API, cached, may be stale | TanStack Query | Sessions list, evaluation results |
| **Client State** | UI-only state, never persisted | React Context / useState | Sidebar open, selected tab |

**Recommendation:** Use TanStack Query for ALL server state. Do NOT put API data in Zustand or Context.

### TanStack Query Configuration

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Query Key Strategy

Use a consistent query key factory pattern:

```typescript
// features/chat/api.ts
export const chatKeys = {
  all: ['chat'] as const,
  sessions: () => [...chatKeys.all, 'sessions'] as const,
  session: (id: string) => [...chatKeys.all, 'session', id] as const,
};

// features/ingestion/api.ts
export const ingestionKeys = {
  all: ['ingestion'] as const,
  jobs: () => [...ingestionKeys.all, 'jobs'] as const,
  jobStatus: (id: string) => [...ingestionKeys.all, 'status', id] as const,
};
```

### When to Use Each State Tool

| Scenario | Use | Why |
|----------|-----|-----|
| API response data | TanStack Query | Caching, background refresh, loading/error states |
| Form input values | useState or react-hook-form | Local, ephemeral |
| Sidebar open/closed | useState in layout | Simple UI toggle |
| Selected session ID | URL params (React Router) | Shareable, bookmarkable |
| Theme preference | Context + localStorage | App-wide, persistent |
| Modal open state | useState in parent | Scoped to component tree |

### Polling Pattern for Long-Running Jobs

Ingestion jobs require polling. Use TanStack Query's `refetchInterval`:

```typescript
// features/ingestion/hooks/useJobPolling.ts
export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ingestionKeys.jobStatus(jobId!),
    queryFn: () => fetchJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop polling when job completes or fails
      if (status === 'completed' || status === 'failed') {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
  });
}
```

## API Client Architecture

### Base API Client

```typescript
// lib/api-client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public originalError?: unknown
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let detail = 'Unknown error';
    try {
      const errorData = await response.json();
      detail = errorData.detail || JSON.stringify(errorData);
    } catch {
      detail = response.statusText;
    }
    throw new ApiError(response.status, detail);
  }

  return response.json();
}
```

### Feature API Module Pattern

Each feature has its own api.ts that wraps the base client:

```typescript
// features/chat/api.ts
import { apiClient } from '@/lib/api-client';
import type { ChatRequest, ChatResponse, SessionResponse } from './types';

export const chatKeys = {
  all: ['chat'] as const,
  sessions: () => [...chatKeys.all, 'sessions'] as const,
  session: (id: string) => [...chatKeys.all, 'session', id] as const,
};

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  return apiClient<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getSession(sessionId: string): Promise<SessionResponse> {
  return apiClient<SessionResponse>(`/sessions/${sessionId}`);
}

export async function listSessions(): Promise<{ sessions: SessionResponse[] }> {
  return apiClient('/sessions');
}
```

### Custom Hook Pattern

```typescript
// features/chat/hooks/useChat.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage, chatKeys } from '../api';
import type { ChatRequest } from '../types';

export function useChat() {
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: (request: ChatRequest) => sendMessage(request),
    onSuccess: (data) => {
      // Invalidate sessions list to show new/updated session
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
      // Optionally update session cache directly
      if (data.session_id) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.session(data.session_id)
        });
      }
    },
  });

  return {
    sendMessage: sendMessageMutation.mutate,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
    lastResponse: sendMessageMutation.data,
  };
}
```

## Component Patterns

### Page Component Pattern

```typescript
// features/chat/components/ChatPage.tsx
export function ChatPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { sendMessage, isLoading: sending, lastResponse } = useChat();

  return (
    <PageLayout title="Chat">
      <div className="grid grid-cols-4 gap-6">
        <aside className="col-span-1">
          <SessionList
            sessions={sessions}
            selectedId={selectedSessionId}
            onSelect={setSelectedSessionId}
            isLoading={sessionsLoading}
          />
        </aside>
        <main className="col-span-3 flex flex-col">
          <MessageList sessionId={selectedSessionId} />
          <MessageInput
            onSubmit={(message) => sendMessage({
              message,
              session_id: selectedSessionId
            })}
            isLoading={sending}
          />
          {lastResponse?.sources && (
            <SourcesList sources={lastResponse.sources} />
          )}
        </main>
      </div>
    </PageLayout>
  );
}
```

### Loading and Error States

Use TanStack Query's built-in states:

```typescript
function SessionList({ sessions, isLoading, error }) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load sessions"
        onRetry={() => refetch()}
      />
    );
  }

  if (!sessions?.length) {
    return <EmptyState message="No sessions yet. Start a new chat!" />;
  }

  return (
    <ul>
      {sessions.map((session) => (
        <SessionListItem key={session.id} session={session} />
      ))}
    </ul>
  );
}
```

## Patterns to Follow

### Pattern 1: Feature-Based Organization

**What:** Group by feature (chat, retrieval) not by type (components, hooks)
**When:** Always for application features
**Why:** Related code stays together, easier to navigate, simpler refactoring

```
GOOD:
features/
  chat/
    components/ChatPage.tsx
    hooks/useChat.ts
    api.ts

BAD:
components/
  ChatPage.tsx
hooks/
  useChat.ts
api/
  chat.ts
```

### Pattern 2: Collocate Types with Features

**What:** Put feature-specific types in the feature folder
**When:** Types only used by one feature
**Why:** Reduces import complexity, keeps related code together

```typescript
// features/chat/types.ts
export interface ChatRequest {
  message: string;
  session_id?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ChatResponse {
  message: string;
  session_id: string;
  sources: string[];
  timestamp: string;
}
```

### Pattern 3: URL State for Shareable State

**What:** Use URL parameters for state that should survive page refresh
**When:** Selected item IDs, filter values, pagination
**Why:** Shareable links, browser back/forward works

```typescript
// Use React Router's useSearchParams
function EvaluationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedEvalId = searchParams.get('id');

  const selectEvaluation = (id: string) => {
    setSearchParams({ id });
  };
}
```

### Pattern 4: Optimistic Updates for Better UX

**What:** Update UI immediately, then sync with server
**When:** Actions where result is predictable (sending message)
**Why:** Feels instant to user

```typescript
const sendMessageMutation = useMutation({
  mutationFn: sendMessage,
  onMutate: async (newMessage) => {
    // Optimistically add message to UI
    await queryClient.cancelQueries({ queryKey: chatKeys.session(sessionId) });
    const previousData = queryClient.getQueryData(chatKeys.session(sessionId));

    queryClient.setQueryData(chatKeys.session(sessionId), (old) => ({
      ...old,
      messages: [...old.messages, { role: 'user', content: newMessage.message }],
    }));

    return { previousData };
  },
  onError: (err, newMessage, context) => {
    // Rollback on error
    queryClient.setQueryData(chatKeys.session(sessionId), context.previousData);
  },
});
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Prop Drilling API Data

**What:** Passing API data through many component levels
**Why bad:** Creates coupling, hard to refactor
**Instead:** Use TanStack Query directly in components that need the data

```typescript
// BAD: Prop drilling
function App() {
  const { data } = useSessions();
  return <Layout sessions={data}><ChatPage sessions={data} /></Layout>;
}

// GOOD: Query where needed
function SessionList() {
  const { data: sessions } = useSessions(); // Query directly
  return <ul>{sessions?.map(...)}</ul>;
}
```

### Anti-Pattern 2: Mixing Server and Client State

**What:** Putting API data in Zustand/Redux
**Why bad:** Duplicate caching logic, stale data bugs, complexity
**Instead:** TanStack Query for server state, Context/useState for UI state

### Anti-Pattern 3: Giant Page Components

**What:** 500+ line page components with all logic inline
**Why bad:** Hard to test, hard to read, can't reuse
**Instead:** Extract into smaller components and custom hooks

### Anti-Pattern 4: useEffect for Data Fetching

**What:** Manual useEffect + useState for API calls
**Why bad:** No caching, no deduplication, error handling complexity
**Instead:** TanStack Query handles all of this

```typescript
// BAD
function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/sessions').then(r => r.json()).then(setSessions).finally(() => setLoading(false));
  }, []);
}

// GOOD
function Sessions() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
  });
}
```

## Backend API Integration Map

Based on the existing FastAPI backend, here's how each endpoint maps to frontend features:

### Chat Feature

| Endpoint | Method | Frontend Usage |
|----------|--------|----------------|
| `/chat` | POST | `useChat` mutation - send message, receive response |
| `/sessions/{session_id}` | GET | `useSession` query - load conversation history |
| `/sessions` | GET | `useSessions` query - list all sessions in sidebar |

### Retrieval Feature

| Endpoint | Method | Frontend Usage |
|----------|--------|----------------|
| `/retrieve` | POST | `useRetrieval` mutation - test retrieval with parameters |

### Ingestion Feature

| Endpoint | Method | Frontend Usage |
|----------|--------|----------------|
| `/ingestion/start_job` | POST | `useStartIngestion` mutation |
| `/ingestion/status/{job_id}` | GET | `useJobStatus` query with polling |
| `/ingestion/jobs` | GET | `useActiveJobs` query - list for monitoring |
| `/assets/list` | GET | `useAssets` query - folder selection dropdown |

### Evaluation Feature

| Endpoint | Method | Frontend Usage |
|----------|--------|----------------|
| `/evaluation/start` | POST | `useStartEvaluation` mutation |
| `/evaluation/{evaluation_id}` | GET | `useEvaluationStatus` query |
| `/evaluations` | GET | `useEvaluations` query - list with comparison |

## Type Generation Strategy

**Recommendation:** Manually define TypeScript types mirroring the Pydantic schemas, stored in `types/api.ts`.

The backend Pydantic schemas are well-defined in:
- `src/posts/schemas.py` - Retrieval types
- `src/sessions/schemas.py` - Chat/session types
- `src/distributed_task/schemas.py` - Ingestion types
- `src/evaluation/schemas.py` - Evaluation types

```typescript
// types/api.ts - Mirror of backend schemas
export interface ChatRequest {
  message: string;
  session_id?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ChatResponse {
  message: string;
  session_id: string;
  sources: string[];
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface RetrievalRequest {
  query: string;
  top_k?: number;
  use_query_enhancer?: boolean;
  use_reranking?: boolean;
  pipeline_type?: 'recursive_overlap' | 'semantic';
}

export interface RetrievedDocument {
  text: string;
  source: string;
  score: number | null;
  metadata: Record<string, unknown>;
}

export interface RetrievalResponse {
  query: string;
  documents: RetrievedDocument[];
  total_retrieved: number;
}

export interface TaskProgress {
  job_id: string;
  status: 'pending' | 'processing' | 'chunking' | 'indexing' | 'completed' | 'failed';
  total_documents?: number;
  processed_documents?: number;
  successful_documents?: number;
  failed_documents?: number;
  documents_left?: number;
  current_file?: string;
  estimated_time_remaining_seconds?: number;
  progress_percentage?: number;
  error_message?: string;
  total_time_seconds?: number;
}

export interface IngestionJobRequest {
  folder_path: string;
  file_types?: string[];
  pipeline_type?: 'recursive_overlap' | 'semantic';
}

export interface IngestionJobResponse {
  job_id: string;
  status: string;
  message: string;
}

export interface EvaluationRequest {
  folder_path: string;
  top_k?: number;
  use_query_enhancer?: boolean;
  use_reranking?: boolean;
  num_questions_per_doc?: number;
  source_evaluation_id?: string | null;
  question_group_id?: string | null;
}

export interface EvaluationStatusResponse {
  evaluation_id: string;
  question_group_id: string;
  status: string;
  folder_path: string;
  retrieve_params: Record<string, unknown>;
  num_documents_processed: number;
  created_at: string;
  completed_at?: string;
  results_summary?: Record<string, unknown>;
  error_message?: string;
  related_evaluation_ids: string[];
}
```

## Build Order Implications

Based on component dependencies, recommended build order:

### Phase 1: Foundation (No API needed)
1. Vite + React + TypeScript setup
2. Tailwind + shadcn/ui installation
3. `components/ui/` - Button, Card, Input, etc.
4. `components/layout/` - PageLayout, Sidebar, Header
5. Router setup with placeholder pages

**Dependency:** None. Can be built and visually tested without backend.

### Phase 2: API Layer
1. `lib/api-client.ts` - Base fetch wrapper
2. `types/api.ts` - All API types
3. `lib/query-client.ts` - TanStack Query setup

**Dependency:** Requires types from backend schemas (read-only reference).

### Phase 3: Chat Feature
1. `features/chat/api.ts` + `types.ts`
2. `features/chat/hooks/useSessions.ts`
3. `features/chat/components/SessionList.tsx`
4. `features/chat/hooks/useChat.ts`
5. `features/chat/components/MessageList.tsx`, `MessageInput.tsx`
6. `features/chat/components/ChatPage.tsx`

**Dependency:** Requires Phase 2. Backend `/chat` and `/sessions` endpoints.

### Phase 4: Retrieval Feature
1. `features/retrieval/api.ts` + `types.ts`
2. `features/retrieval/hooks/useRetrieval.ts`
3. `features/retrieval/components/QueryForm.tsx`, `ResultsList.tsx`
4. `features/retrieval/components/RetrievalPage.tsx`

**Dependency:** Requires Phase 2. Backend `/retrieve` endpoint.

### Phase 5: Ingestion Feature
1. `features/ingestion/api.ts` + `types.ts`
2. `features/ingestion/hooks/useIngestionJob.ts`
3. `features/ingestion/hooks/useJobPolling.ts` - polling complexity
4. `features/ingestion/components/JobStartForm.tsx`, `ProgressBar.tsx`
5. `features/ingestion/components/IngestionPage.tsx`

**Dependency:** Requires Phase 2. Backend ingestion endpoints. More complex due to polling.

### Phase 6: Evaluation Feature
1. `features/evaluation/api.ts` + `types.ts`
2. `features/evaluation/hooks/useEvaluation.ts`
3. `features/evaluation/components/ComparisonTable.tsx`
4. `features/evaluation/components/EvaluationPage.tsx`

**Dependency:** Requires Phase 2. Backend evaluation endpoints.

## Scalability Considerations

| Concern | Current Scale | At 10x Scale | Recommendation |
|---------|---------------|--------------|----------------|
| Bundle size | Small | Medium | Lazy load feature pages with React.lazy |
| API calls | Few | Many concurrent | TanStack Query handles deduplication |
| State complexity | Low | Medium | Keep server/client state separation |
| Type safety | Manual | Consider openapi-typescript | Manual is fine for this scope |

## Sources

**Note:** Web search and Context7 were unavailable during this research. This architecture document is based on:

- **TanStack Query:** Official documentation patterns (training knowledge, HIGH confidence - widely established)
- **React patterns:** Official React documentation, established community patterns (HIGH confidence)
- **shadcn/ui:** Component architecture philosophy (training knowledge, HIGH confidence - well-known approach)
- **Vite + React:** Official Vite React template patterns (HIGH confidence)
- **Feature-based architecture:** Established pattern from React community (Bulletproof React, Kent C. Dodds) (HIGH confidence)
- **Backend API structure:** Direct analysis of existing `src/posts/router.py`, `src/*/schemas.py` files (HIGH confidence - verified from codebase)

**Confidence Assessment:**
- Component structure: HIGH (established React patterns)
- State management approach: HIGH (TanStack Query is standard for this use case)
- API client patterns: HIGH (typed fetch is well-established)
- Build order: HIGH (based on actual dependency analysis)
