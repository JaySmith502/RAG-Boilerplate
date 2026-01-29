# Domain Pitfalls: React SaaS Dashboard

**Domain:** Customer-facing React frontend for document Q&A system
**Stack:** Vite + TypeScript + Tailwind CSS + shadcn/ui
**Researched:** 2026-01-29
**Confidence:** MEDIUM (based on official documentation + established patterns)

---

## Critical Pitfalls

Mistakes that cause rewrites, major user experience issues, or architectural debt.

---

### Pitfall 1: Dark Mode Flash of Unstyled Content (FOUC)

**What goes wrong:** Users see a flash of light mode before dark mode applies on page load, or vice versa. This creates a jarring, unprofessional experience.

**Why it happens:**
- Theme state is managed in React state/context, which only initializes after JavaScript hydrates
- CSS loads before JavaScript, so the default theme appears first
- `localStorage` theme preference is read too late in the render cycle

**Consequences:**
- Unprofessional appearance (flash of wrong theme)
- User complaints about "blinking" interface
- Potential accessibility issues (sudden brightness change)

**Warning signs:**
- Theme toggle works but page refresh shows wrong theme briefly
- Dark mode preference not respected on initial load
- Visible flicker between themes during navigation

**Prevention:**
1. Add inline script in `<head>` (before CSS) to set theme class immediately:
```html
<script>
  (function() {
    const theme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  })();
</script>
```
2. Configure Tailwind with class-based dark mode: `@custom-variant dark (&:where(.dark, .dark *))`
3. Never rely solely on React state for initial theme determination

**Phase to address:** Phase 1 (Foundation) - Must be in initial setup before any UI work.

**Source:** [Tailwind CSS Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode) - "Add inline in `head` to avoid FOUC"

---

### Pitfall 2: useEffect for Data Transformation (Render Cascade)

**What goes wrong:** Computed values stored in state and updated via `useEffect`, causing inefficient cascading re-renders and stale UI.

**Why it happens:**
- Developers treat `useEffect` as "do stuff after render" hook
- Coming from class components where `componentDidUpdate` was the pattern
- Not understanding React's rendering model

**Consequences:**
- Extra render passes (stale value shown, then corrected)
- Performance degradation in data-heavy dashboards
- Subtle bugs from race conditions

**Warning signs:**
- Multiple `useState` + `useEffect` pairs for derived values
- "Flickering" data in the UI
- Complex dependency arrays with computed values

**Prevention:**

Instead of:
```typescript
// BAD: causes extra render
const [filteredSessions, setFilteredSessions] = useState([]);
useEffect(() => {
  setFilteredSessions(sessions.filter(s => s.status === filter));
}, [sessions, filter]);
```

Do this:
```typescript
// GOOD: calculated during render
const filteredSessions = useMemo(
  () => sessions.filter(s => s.status === filter),
  [sessions, filter]
);
```

**Rules:**
- If you can calculate it from props/state, calculate it during render
- Use `useMemo` for expensive calculations
- Reserve `useEffect` only for synchronizing with external systems

**Phase to address:** All phases - Establish pattern in Phase 1, enforce throughout.

**Source:** [React Documentation: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

---

### Pitfall 3: API Call Race Conditions

**What goes wrong:** Stale API responses overwrite fresh data. User switches sessions rapidly and sees data from wrong session.

**Why it happens:**
- Async responses can arrive out of order
- Component doesn't track which request is current
- No cleanup on component unmount or parameter change

**Consequences:**
- Wrong data displayed (critical for chat sessions)
- Data corruption appearance
- Confused users seeing mismatched content

**Warning signs:**
- Rapidly clicking different sessions shows inconsistent data
- Data sometimes appears from previously selected item
- Race condition in testing when simulating fast clicks

**Prevention with cleanup pattern:**
```typescript
useEffect(() => {
  let ignore = false;

  async function fetchSession() {
    setLoading(true);
    const result = await api.getSession(sessionId);
    if (!ignore) {
      setSession(result);
      setLoading(false);
    }
  }

  fetchSession();

  return () => {
    ignore = true; // Ignore stale responses
  };
}, [sessionId]);
```

**Better: Use TanStack Query** (handles this automatically):
```typescript
const { data: session, isLoading } = useQuery({
  queryKey: ['session', sessionId],
  queryFn: () => api.getSession(sessionId),
});
```

**Phase to address:** Phase 1 (Foundation) - Choose data fetching strategy upfront.

**Source:** [React Documentation: Suspense](https://react.dev/reference/react/Suspense) - cleanup pattern for race conditions

---

### Pitfall 4: Prop Drilling Through Component Hierarchy

**What goes wrong:** Props passed through 5+ component levels to reach leaf components. Changing a prop signature requires updating entire chain.

**Why it happens:**
- Starting without state management strategy
- "We'll add state management later" approach
- Not recognizing which state is truly global

**Consequences:**
- Massive refactoring when requirements change
- Components unnecessarily re-render due to parent prop changes
- Difficulty testing components in isolation
- Code becomes brittle and hard to maintain

**Warning signs:**
- Props passed through components that don't use them
- Adding a new feature requires changes in 5+ files
- Components have many props unrelated to their core function
- TypeScript interfaces grow unwieldy

**Prevention:**

1. **Identify state categories upfront:**
   - **Server state:** Sessions, documents, evaluation results -> TanStack Query
   - **UI state:** Theme, sidebar collapsed, modal open -> Zustand or React Context
   - **Form state:** Input values, validation -> Form library (react-hook-form)
   - **URL state:** Current session ID, filters -> URL parameters

2. **Use composition instead of drilling:**
```typescript
// BAD: drilling
<App onSessionSelect={fn}>
  <Sidebar onSessionSelect={fn}>
    <SessionList onSessionSelect={fn}>
      <SessionItem onSessionSelect={fn} />
    </SessionList>
  </Sidebar>
</App>

// GOOD: composition
<App>
  <Sidebar>
    <SessionList>
      {sessions.map(s => (
        <SessionItem
          key={s.id}
          session={s}
          onClick={() => navigate(`/session/${s.id}`)}
        />
      ))}
    </SessionList>
  </Sidebar>
</App>
```

**Phase to address:** Phase 1 (Foundation) - Establish state management patterns before building features.

---

### Pitfall 5: Inconsistent Loading and Error States

**What goes wrong:** Some components show loading spinners, others show nothing. Some show error messages, others silently fail. No consistent skeleton patterns.

**Why it happens:**
- Loading states added ad-hoc per component
- No design system for loading/error patterns
- Developers handle errors differently
- Empty states not designed

**Consequences:**
- Unprofessional, inconsistent user experience
- Users uncertain if app is working
- Layout shift when content loads (CLS issues)
- Silent failures lead to confusion

**Warning signs:**
- Different loading indicators across app
- Some pages show blank on load
- Errors sometimes shown, sometimes logged only
- Layout jumps when content appears

**Prevention:**

1. **Create standard loading components in design system:**
```typescript
// Establish once, use everywhere
<Skeleton className="h-12 w-full" />           // For rows
<Skeleton className="h-[200px] w-full" />      // For cards
<DataTableSkeleton rows={10} columns={5} />    // For tables
```

2. **Standardized error boundary with retry:**
```typescript
<ErrorBoundary
  fallback={<ErrorCard onRetry={() => refetch()} />}
>
  <SessionList />
</ErrorBoundary>
```

3. **Consistent empty states:**
```typescript
if (sessions.length === 0) {
  return <EmptyState
    icon={<MessageSquare />}
    title="No sessions yet"
    description="Start a conversation to create your first session."
    action={<Button>New Chat</Button>}
  />;
}
```

4. **Use Suspense boundaries strategically:**
```typescript
<Suspense fallback={<SessionListSkeleton />}>
  <SessionList />
</Suspense>
```

**Phase to address:** Phase 1 (Foundation) - Define loading/error patterns before building features.

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded user experience.

---

### Pitfall 6: Not Using Component Keys Correctly

**What goes wrong:** Lists re-render entirely instead of updating. Component state persists incorrectly across data changes.

**Why it happens:**
- Using array index as key
- Not understanding React's reconciliation algorithm
- Forgetting keys on session/chat switching

**Consequences:**
- Performance issues with large lists
- State bleeding between different data items
- Input fields retaining wrong values

**Warning signs:**
- Form inputs show stale data when switching items
- List animations not working as expected
- React DevTools warnings about keys

**Prevention:**
```typescript
// BAD: Index as key
{sessions.map((session, index) => (
  <SessionCard key={index} session={session} />
))}

// GOOD: Stable identifier
{sessions.map((session) => (
  <SessionCard key={session.id} session={session} />
))}

// GOOD: Reset component state when entity changes
<ChatView key={sessionId} sessionId={sessionId} />
```

**Phase to address:** All phases - Easy to get wrong, enforce in code review.

**Source:** [React Documentation: Suspense](https://react.dev/reference/react/Suspense) - "Use key to reset boundaries"

---

### Pitfall 7: Overusing Global State

**What goes wrong:** Everything in Zustand/Redux, including data that should be server state or component state.

**Why it happens:**
- "Just put it in global state" is easy short-term
- Not distinguishing server state from UI state
- Fear of prop drilling leads to overcorrection

**Consequences:**
- State gets out of sync with server
- Manual cache invalidation needed everywhere
- Complex state management for simple features
- Difficult to track what depends on what

**Warning signs:**
- Zustand store has API response shapes directly
- Manual refetching after mutations
- "Why isn't this updating?" bugs
- Store has 20+ slices

**Prevention:**

**Server State (TanStack Query):**
- Sessions list
- Session messages
- Ingestion jobs
- Evaluation results

**UI State (Zustand/Context):**
- Sidebar collapsed
- Theme preference
- Modal open states
- Active tab

**Component State (useState):**
- Input values
- Form validation
- Hover/focus states
- Dropdown open

**Phase to address:** Phase 1 (Foundation) - Define state boundaries upfront.

---

### Pitfall 8: Hardcoded Colors Instead of CSS Variables

**What goes wrong:** Dark mode requires duplicate color values everywhere. Brand color change requires find-and-replace across codebase.

**Why it happens:**
- Using Tailwind color classes directly (`bg-blue-500`)
- Not setting up shadcn/ui CSS variables properly
- Not understanding the theming system

**Consequences:**
- Dark mode colors inconsistent
- Rebranding requires massive changes
- Accessibility contrast issues in one mode
- Designer frustration with implementation

**Prevention:**

1. **Use semantic color tokens:**
```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --muted: 210 40% 96%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
}
```

2. **Use semantic classes:**
```typescript
// BAD: hardcoded
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

// GOOD: semantic
<div className="bg-background text-foreground">
```

3. **shadcn/ui components use CSS variables by default** - don't override with hardcoded colors.

**Phase to address:** Phase 1 (Foundation) - Set up theme correctly before building.

---

### Pitfall 9: No TypeScript Strictness

**What goes wrong:** TypeScript configured loosely, allowing `any` everywhere. Type errors caught at runtime instead of compile time.

**Why it happens:**
- Quick setup without strict config
- Legacy code with `any` proliferates
- "We'll fix types later"

**Consequences:**
- Runtime errors that TypeScript should catch
- IDE autocompletion unreliable
- API contract changes not caught
- Refactoring becomes dangerous

**Warning signs:**
- `any` type scattered through codebase
- Type assertions (`as Type`) used to silence errors
- Runtime "undefined is not a function" errors
- API shape changes break app silently

**Prevention:**

1. **Strict tsconfig.json from day 1:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

2. **Type API responses explicitly:**
```typescript
// Define types matching backend schemas
interface Session {
  id: string;
  messages: Message[];
  metadata: SessionMetadata;
}

// Type the API client
async function getSession(id: string): Promise<Session> {
  const response = await fetch(`/api/sessions/${id}`);
  return response.json() as Promise<Session>;
}
```

3. **Ban `any` in ESLint:**
```javascript
// eslint config
"@typescript-eslint/no-explicit-any": "error"
```

**Phase to address:** Phase 1 (Foundation) - Non-negotiable from the start.

---

### Pitfall 10: Component Abstraction Too Early or Too Late

**What goes wrong:** Either everything is a component (Button, IconButton, PrimaryButton, SecondaryButton, GhostButton...) or nothing is abstracted (copy-paste everywhere).

**Why it happens:**
- Premature abstraction before patterns emerge
- Never abstracting because "this is simpler"
- Not recognizing when copy-paste becomes maintenance burden

**Consequences:**
- Over-abstraction: Props explosion, hard to use, documentation needed
- Under-abstraction: Inconsistent behavior, bugs fixed in one place not others

**Warning signs:**
- Component has 15+ props
- Same code copied in 3+ places
- "Which Button component do I use?"
- Fixing a bug requires changes in multiple files

**Prevention:**

**Rule of Three:** Wait for 3 instances before abstracting.

**shadcn/ui philosophy:** Components are copied into your project, not imported from node_modules. This allows customization without abstraction overhead.

**Component hierarchy:**
```
1. shadcn/ui primitives (Button, Card, Input)
   - Use as-is most of the time

2. Composed components (SessionCard, ChatMessage)
   - Combine primitives for domain concepts

3. Feature components (SessionList, ChatView)
   - Business logic + composed components

4. Page components (ChatPage, DashboardPage)
   - Layout + feature components
```

**Phase to address:** All phases - Review abstractions at each phase boundary.

---

## Minor Pitfalls

Mistakes that cause annoyance but are recoverable.

---

### Pitfall 11: Uncontrolled Form Inputs for Complex Forms

**What goes wrong:** Forms with many fields become unwieldy with individual `useState` per field.

**Why it happens:**
- Starting simple with `useState` per input
- Not anticipating validation needs
- Form library seen as overhead

**Prevention:**
- Use react-hook-form from the start for any form with 3+ fields
- Integrate with zod for schema validation
- shadcn/ui has built-in form components that work with react-hook-form

**Phase to address:** Phase 2 (Core Features) - When building ingestion and evaluation forms.

---

### Pitfall 12: Not Handling Network Errors Gracefully

**What goes wrong:** Network error shows technical message or crashes the app.

**Why it happens:**
- Only handling success case
- Try/catch but just `console.error`
- Backend error format not parsed

**Prevention:**
```typescript
// API client with consistent error handling
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
  }
}

// User-friendly error messages
const errorMessages: Record<number, string> = {
  401: "Please sign in to continue",
  403: "You don't have permission to do this",
  404: "The requested item was not found",
  500: "Something went wrong. Please try again.",
};
```

**Phase to address:** Phase 1 (Foundation) - Error handling in API client setup.

---

### Pitfall 13: Ignoring Responsive Design Until End

**What goes wrong:** Desktop-first development, then scramble to make mobile work.

**Why it happens:**
- Developing on large monitor
- "We'll handle mobile later"
- Not testing at different breakpoints

**Prevention:**
- Mobile-first Tailwind classes: `w-full md:w-1/2 lg:w-1/3`
- Test at common breakpoints during development
- Define responsive behavior in component design

**Phase to address:** All phases - Check responsive at each feature completion.

---

### Pitfall 14: Bundle Size Bloat from Unused Imports

**What goes wrong:** Bundle grows large due to importing entire libraries.

**Why it happens:**
- `import * as Icons from 'lucide-react'`
- Not tree-shaking aware imports
- Dev dependencies in production bundle

**Prevention:**
```typescript
// BAD: imports all icons
import * as Icons from 'lucide-react';

// GOOD: tree-shakeable
import { Search, MessageSquare, Settings } from 'lucide-react';
```

- Use `vite-bundle-visualizer` to inspect bundle
- Check for accidental dev dependency inclusion

**Phase to address:** Final phase - Bundle audit before production.

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Phase 1: Foundation | Dark mode FOUC, Missing TypeScript strictness | Inline theme script in `<head>`, strict tsconfig from day 1 |
| Phase 2: Chat UI | API race conditions, Session state bleeding | Use TanStack Query, proper component keys |
| Phase 3: Data Tables | List performance, Inconsistent loading states | Virtual scrolling for large lists, skeleton components |
| Phase 4: Ingestion UI | Form complexity, Progress state sync | react-hook-form + zod, polling or SSE for progress |
| Phase 5: Evaluation UI | Complex data visualization, State management sprawl | Keep charts server-state, minimal global UI state |
| Phase 6: Polish | Bundle size, Responsive gaps | Bundle analyzer, breakpoint testing |

---

## Specific Warnings for This Project

Based on the existing Gradio app and FastAPI backend:

### Chat Sessions State

The current Gradio app uses `gr.State(None)` for session tracking. In React:
- **Do NOT** store session ID in global state alone
- **DO** use URL parameter (`/chat/:sessionId`) as source of truth
- **DO** use TanStack Query to cache session data with sessionId as query key

### Progress Monitoring (Ingestion/Evaluation)

Current Gradio uses polling with refresh button. In React:
- Polling with `useQuery` + `refetchInterval` when job is active
- Or implement SSE/WebSocket for real-time updates
- Show meaningful progress (not just percentage) - what file, how many remaining

### API Client Pattern

The current `api_client.py` returns `{"error": str(e)}` on failure. In React:
- Parse this pattern explicitly
- Distinguish network errors from API errors
- Type the responses to match backend Pydantic schemas

---

## Sources

| Source | Type | Confidence |
|--------|------|------------|
| [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode) | Official Documentation | HIGH |
| [React: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) | Official Documentation | HIGH |
| [React: Suspense](https://react.dev/reference/react/Suspense) | Official Documentation | HIGH |
| Industry patterns for SaaS dashboards | Training knowledge | MEDIUM |
| shadcn/ui conventions | Commonly established patterns | MEDIUM |
