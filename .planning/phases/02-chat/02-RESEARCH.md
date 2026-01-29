# Phase 02: Chat - Research

**Researched:** 2026-01-29
**Domain:** React chat interface with TanStack Query, session management, and shadcn/ui
**Confidence:** HIGH

## Summary

This phase implements a chat interface for the RAG document Q&A system. The existing codebase provides a solid foundation: React 19, TanStack Query v5, Tailwind CSS v4, shadcn/ui components, and a typed API client. The backend already has endpoints for session management (`GET /sessions`, `GET /sessions/{session_id}`) and chat (`POST /chat`).

The standard approach uses TanStack Query for data fetching and mutations, shadcn/ui components for consistent styling, and established React patterns for chat UI (message bubbles, auto-scroll, input handling). The implementation requires adding a few shadcn/ui components (scroll-area, collapsible, card, textarea) and building custom components for message display and session management.

**Primary recommendation:** Use TanStack Query's `useMutation` for sending messages with `onSuccess` invalidation, custom message bubble components with Tailwind, and a `useChatScroll` hook for auto-scroll behavior that respects user scroll position.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-query | ^5.90.20 | Server state management | Industry standard for data fetching, caching, mutations |
| React | ^19.2.0 | UI framework | Already in project |
| Tailwind CSS | ^4.1.18 | Styling | Already configured |
| shadcn/ui | latest | UI components | Already configured, provides accessible components |
| lucide-react | ^0.563.0 | Icons | Already installed, consistent iconography |
| sonner | ^2.0.7 | Toast notifications | Already installed |

### Supporting (To Install)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-scroll-area | latest | Custom scrollable containers | For chat message list |
| @radix-ui/react-collapsible | latest | Expand/collapse sections | For source citations |

**Installation:**
```bash
cd frontend
npx shadcn@latest add scroll-area collapsible card textarea
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom scroll hooks | react-virtualized | Overkill for typical chat volumes (<1000 messages) |
| Custom chat bubbles | @chatscope/chat-ui-kit | Heavy dependency, less customizable |
| TanStack Query polling | WebSocket/SSE | Would require backend changes, polling sufficient for this use case |

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/features/chat/
├── ChatPage.tsx              # Main page component
├── components/
│   ├── ChatContainer.tsx     # Layout container for chat area
│   ├── MessageList.tsx       # Scrollable message list with auto-scroll
│   ├── MessageBubble.tsx     # Individual message display (user/assistant)
│   ├── MessageInput.tsx      # Input area with Enter to send
│   ├── SourceCitations.tsx   # Collapsible source display
│   └── ChatSessionList.tsx   # Sidebar session list
├── hooks/
│   ├── useSessions.ts        # Session list query hook
│   ├── useSession.ts         # Single session query hook
│   ├── useSendMessage.ts     # Chat mutation hook
│   └── useChatScroll.ts      # Auto-scroll behavior hook
└── types.ts                  # Local type definitions (if needed)
```

### Pattern 1: TanStack Query Mutation with Invalidation
**What:** Use `useMutation` for sending messages, invalidate session query on success
**When to use:** All chat message submissions
**Example:**
```typescript
// Source: TanStack Query v5 docs
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ChatRequest, ChatResponse } from '@/types/api'

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: ChatRequest) => {
      return apiClient<ChatResponse>('/chat', {
        method: 'POST',
        body: request,
      })
    },
    onSuccess: (data) => {
      // Invalidate session query to refetch with new messages
      queryClient.invalidateQueries({
        queryKey: ['session', data.session_id]
      })
      // Also invalidate sessions list (for last_activity update)
      queryClient.invalidateQueries({
        queryKey: ['sessions']
      })
    },
  })
}
```

### Pattern 2: Smart Auto-Scroll Hook
**What:** Custom hook that auto-scrolls to bottom but respects user scroll position
**When to use:** Chat message list containers
**Example:**
```typescript
// Source: React chat patterns research
import { useRef, useEffect, useCallback } from 'react'

export function useChatScroll<T>(deps: T[]) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isUserScrolledUp = useRef(false)

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    // User is "at bottom" if within 100px of bottom
    isUserScrolledUp.current = scrollHeight - scrollTop - clientHeight > 100
  }, [])

  useEffect(() => {
    if (!containerRef.current || isUserScrolledUp.current) return
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, deps)

  return { containerRef, handleScroll }
}
```

### Pattern 3: Optimistic UI Updates
**What:** Show user message immediately while waiting for API response
**When to use:** When API latency is noticeable (>200ms)
**Example:**
```typescript
// Source: TanStack Query v5 docs - simplified optimistic approach
const { isPending, variables, mutate } = useMutation({
  mutationFn: sendMessage,
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
})

// In render - show pending message optimistically
{isPending && variables && (
  <MessageBubble
    role="user"
    content={variables.message}
    isPending
  />
)}
```

### Pattern 4: Enter to Send, Shift+Enter for Newline
**What:** Submit on Enter key, allow newlines with Shift+Enter
**When to use:** Chat input textarea
**Example:**
```typescript
// Source: React form patterns research
const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (message.trim()) {
      handleSubmit()
    }
  }
  // Shift+Enter naturally creates newline (default behavior)
}
```

### Anti-Patterns to Avoid
- **Polling for new messages while mutation is pending:** Use `invalidateQueries` on mutation success instead of constant polling
- **Manual state management for messages:** Use TanStack Query cache as single source of truth
- **Scroll-to-bottom on every render:** Respect user scroll position to avoid interrupting reading
- **Inline API calls in components:** Extract to custom hooks for reusability and testability

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Custom scrollbars | Native CSS scrollbar styling | shadcn ScrollArea | Cross-browser consistency, accessibility |
| Loading skeletons | Custom animated divs | shadcn Skeleton | Already installed, consistent styling |
| Toast notifications | Alert components | sonner (Toaster) | Already installed, auto-dismiss, stacking |
| Collapsible sections | Manual show/hide state | shadcn Collapsible | Animation, accessibility, keyboard support |
| Copy to clipboard | Raw textarea + execCommand | navigator.clipboard.writeText | Modern API, promise-based, secure |

**Key insight:** The shadcn/ui components handle accessibility (ARIA attributes, keyboard navigation) and edge cases that custom implementations often miss. Always prefer the shadcn component when available.

## Common Pitfalls

### Pitfall 1: Not Handling Empty Session State
**What goes wrong:** App crashes or shows blank when no sessions exist
**Why it happens:** Developers assume sessions array always has data
**How to avoid:** Always render empty states, handle `sessions.length === 0`
**Warning signs:** Testing only with existing data, no empty state designs

### Pitfall 2: Message Input Not Clearing After Send
**What goes wrong:** User's message stays in input after sending
**Why it happens:** State not reset in mutation success handler
**How to avoid:** Clear input state in `useMutation`'s `onSuccess` callback, not `onSettled`
**Warning signs:** Input clears on error too (wrong callback)

### Pitfall 3: Scroll Position Lost During Loading
**What goes wrong:** Message list jumps to top during refetch
**Why it happens:** Re-render during query loading clears scroll position
**How to avoid:** Use `placeholderData: keepPreviousData` in useQuery options
**Warning signs:** Flickering during data updates

### Pitfall 4: Race Condition with Rapid Message Sending
**What goes wrong:** Messages appear out of order
**Why it happens:** Multiple mutations complete in different order than sent
**How to avoid:** Disable send button while `isPending`, or use mutation queue
**Warning signs:** Testing only single message flows

### Pitfall 5: Sources Array Empty Handling
**What goes wrong:** Error when rendering citations with no sources
**Why it happens:** Backend returns empty array, not null
**How to avoid:** Check `sources.length > 0` before rendering citations section
**Warning signs:** Seeing empty "Sources" heading with no content

### Pitfall 6: Clipboard API Fails Silently
**What goes wrong:** Copy button appears to work but doesn't copy
**Why it happens:** Clipboard API requires HTTPS or localhost, user gesture
**How to avoid:** Wrap in try/catch, show toast on success AND failure
**Warning signs:** No error handling around `navigator.clipboard.writeText()`

## Code Examples

Verified patterns from official sources:

### Session List Query Hook
```typescript
// frontend/src/features/chat/hooks/useSessions.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { SessionsListResponse } from '@/types/api'

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => apiClient<SessionsListResponse>('/sessions'),
  })
}
```

### Single Session Query Hook
```typescript
// frontend/src/features/chat/hooks/useSession.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Session } from '@/types/api'

export function useSession(sessionId: string | null) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => apiClient<Session>(`/sessions/${sessionId}`),
    enabled: !!sessionId, // Only fetch when sessionId exists
    placeholderData: keepPreviousData, // Prevent flash during refetch
  })
}
```

### Message Bubble Component
```typescript
// frontend/src/features/chat/components/MessageBubble.tsx
import { cn } from '@/lib/utils'
import type { Message } from '@/types/api'

interface MessageBubbleProps {
  message: Message
  isPending?: boolean
}

export function MessageBubble({ message, isPending }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn(
      'flex w-full',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-[80%] rounded-lg px-4 py-2',
        isUser
          ? 'bg-primary text-primary-foreground rounded-br-none'
          : 'bg-muted rounded-bl-none',
        isPending && 'opacity-70'
      )}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCitations sources={message.sources} />
        )}
      </div>
    </div>
  )
}
```

### Copy to Clipboard Utility
```typescript
// frontend/src/features/chat/utils/clipboard.ts
import { toast } from 'sonner'

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator?.clipboard) {
    toast.error('Clipboard not supported in this browser')
    return false
  }

  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
    return true
  } catch (error) {
    toast.error('Failed to copy to clipboard')
    return false
  }
}
```

### ScrollArea Usage for Message List
```typescript
// Source: shadcn/ui scroll-area docs
import { ScrollArea } from '@/components/ui/scroll-area'

<ScrollArea className="h-[calc(100vh-200px)] w-full">
  <div className="flex flex-col gap-4 p-4">
    {messages.map((message) => (
      <MessageBubble key={message.id} message={message} />
    ))}
    <div ref={scrollAnchorRef} /> {/* Invisible anchor for scroll-to-bottom */}
  </div>
</ScrollArea>
```

### Collapsible Sources Usage
```typescript
// Source: shadcn/ui collapsible docs
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

function SourceCitations({ sources }: { sources: string[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-2">
      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
        {sources.length} source{sources.length !== 1 && 's'}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
        <ul className="text-xs text-muted-foreground space-y-1">
          {sources.map((source, i) => (
            <li key={i} className="truncate">{source}</li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux for server state | TanStack Query | 2020+ | Simpler code, automatic caching, background refetching |
| document.execCommand('copy') | navigator.clipboard.writeText() | 2020+ | Promise-based, more reliable, better security |
| Spinner loading indicators | Skeleton loaders | 2019+ | Better perceived performance, less jarring |
| Manual scroll management | Intersection Observer | 2020+ | More reliable, better performance |
| cacheTime in TanStack Query | gcTime (v5) | 2024 | Renamed parameter, same functionality |

**Deprecated/outdated:**
- `react-query` package name: Use `@tanstack/react-query` (changed in v4)
- `cacheTime` option: Renamed to `gcTime` in v5
- `isLoading` for initial load: Use `isPending` in v5 (isLoading now means isPending && isFetching)

## Open Questions

Things that couldn't be fully resolved:

1. **Session creation timing**
   - What we know: Backend auto-creates session on first message if `session_id` is null
   - What's unclear: Should UI explicitly create session first, or rely on auto-creation?
   - Recommendation: Rely on auto-creation (simpler), display "New Chat" until first message sent

2. **Message streaming support**
   - What we know: Current backend returns complete response (no streaming)
   - What's unclear: Future streaming requirement not specified in phase description
   - Recommendation: Build without streaming, structure allows adding later

3. **Session list data structure from /sessions endpoint**
   - What we know: Returns `{ sessions: Session[], total: number }`
   - What's unclear: Does each session include full messages or just metadata?
   - Recommendation: Assume metadata only (session_id, created_at, message_count); fetch full session separately

## Sources

### Primary (HIGH confidence)
- TanStack Query v5 official docs - mutations, invalidation, optimistic updates
- shadcn/ui official docs - scroll-area, collapsible, card components
- MDN Web Docs - Clipboard API

### Secondary (MEDIUM confidence)
- [TanStack Query Optimistic Updates](https://tanstack.com/query/v5/docs/react/guides/optimistic-updates)
- [TanStack Query Mutations](https://tanstack.com/query/v5/docs/react/guides/mutations)
- [TanStack Query Invalidations from Mutations](https://tanstack.com/query/v5/docs/react/guides/invalidations-from-mutations)
- [shadcn/ui Scroll Area](https://ui.shadcn.com/docs/components/scroll-area)
- [shadcn/ui Collapsible](https://ui.shadcn.com/docs/components/collapsible)
- [usehooks-ts useCopyToClipboard](https://usehooks-ts.com/react-hook/use-copy-to-clipboard)

### Tertiary (LOW confidence)
- Various blog posts on React chat patterns - patterns verified against official docs
- Flowbite Tailwind chat bubbles - styling inspiration only

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project or from official shadcn
- Architecture: HIGH - Patterns from official TanStack Query and React docs
- Pitfalls: MEDIUM - Derived from common patterns, not from specific project failures

**Research date:** 2026-01-29
**Valid until:** 2026-03-01 (stable ecosystem, 30-day validity)
