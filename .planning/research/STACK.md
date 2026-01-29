# Technology Stack: React SaaS Dashboard

**Project:** RAG-Boilerplate Frontend
**Researched:** 2026-01-29
**Research Limitation:** WebSearch/WebFetch unavailable - recommendations based on training data (cutoff May 2025). All version numbers should be verified against current npm/official docs before implementation.

## Executive Summary

This stack recommendation targets a modern SaaS dashboard (Linear/Notion aesthetic) for a document Q&A system. The FastAPI backend is already built with well-defined REST endpoints for chat, retrieval, ingestion, and evaluation. The frontend needs routing, async data fetching with caching, real-time progress updates, forms, and data tables.

**Overall Confidence:** MEDIUM (versions need verification, patterns are stable)

---

## Recommended Stack

### Build Tooling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vite | ^5.x or ^6.x | Build tool | Specified in requirements. Fast HMR, ES modules, excellent DX. Verify latest version. | HIGH (pattern) / MEDIUM (version) |
| TypeScript | ^5.3+ | Type safety | Industry standard. Excellent IDE support, catches errors early, self-documenting. | HIGH |
| pnpm | ^8.x or ^9.x | Package manager | Faster than npm, disk-efficient, strict by default. Better monorepo support if needed later. | HIGH |

**Note:** Vite 6 may have released since my training cutoff. Check `npm view vite version` before proceeding.

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React | ^18.2 or ^19.x | UI framework | Specified in requirements. Stable, huge ecosystem. React 19 may be stable now - verify. | HIGH (pattern) / MEDIUM (version) |
| React DOM | Match React | DOM rendering | Required peer dependency. | HIGH |

**React 19 Note:** If React 19 is stable, it includes built-in support for async/concurrent features. Verify compatibility with chosen libraries.

### Styling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | ^3.4+ or ^4.x | Utility CSS | Specified in requirements. Excellent for rapid UI development. Tailwind v4 may have released - verify. | HIGH (pattern) / MEDIUM (version) |
| tailwind-merge | ^2.x | Class merging | Handles conflicting Tailwind classes in component composition. | HIGH |
| clsx | ^2.x | Conditional classes | Cleaner conditional class syntax than template strings. | HIGH |
| tailwindcss-animate | ^1.x | Animations | Animation utilities for shadcn/ui components. | HIGH |

**Tailwind v4 Note:** Major rewrite with CSS-first config. Check migration path if v4 is stable.

### Component Library

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| shadcn/ui | Latest | Component system | Specified in requirements. Copy-paste components, full ownership, Radix primitives underneath. Not a package - CLI installs components. | HIGH |
| @radix-ui/* | Various | Primitives | Underlying primitives for shadcn/ui. Installed per-component. | HIGH |
| lucide-react | ^0.400+ | Icons | Default icons for shadcn/ui. Clean, consistent, MIT licensed. | HIGH |

**shadcn/ui is not versioned** - it's a component registry. Run `npx shadcn@latest init` to scaffold.

### Routing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **TanStack Router** | ^1.x | Client routing | Type-safe routing, excellent search params handling, file-based routes optional. Better TypeScript integration than React Router. | MEDIUM |

**Alternative considered:** React Router v7

| Criterion | TanStack Router | React Router v7 |
|-----------|-----------------|-----------------|
| Type safety | First-class, inferred | Good, but less automatic |
| Search params | Built-in with types | Manual handling |
| Learning curve | Steeper | More familiar |
| Ecosystem | Newer, growing | Mature, larger |
| SPA focus | Yes | Yes (also supports SSR) |

**Recommendation:** TanStack Router for type-safe search params (useful for filter states, pagination). If team is more familiar with React Router, v7 is solid.

**Verification needed:** Check TanStack Router current version and React Router v7 feature set.

### Data Fetching & Server State

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **TanStack Query** | ^5.x | Server state | Caching, background refetching, optimistic updates, excellent DevTools. Industry standard for REST APIs. | HIGH |

**Why TanStack Query over alternatives:**
- SWR: Less featured (no mutations API, weaker DevTools)
- RTK Query: Overkill unless already using Redux
- Apollo Client: GraphQL-focused, not needed here

**Key patterns for this project:**
```typescript
// Chat sessions - cached by session ID
useQuery({ queryKey: ['session', sessionId], ... })

// Ingestion status - polling until complete
useQuery({
  queryKey: ['ingestion', jobId],
  refetchInterval: (query) =>
    query.state.data?.status === 'completed' ? false : 2000
})

// Evaluations list - stale-while-revalidate
useQuery({ queryKey: ['evaluations'], staleTime: 30000 })
```

### HTTP Client

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **ky** | ^1.x | HTTP client | Cleaner API than fetch, built-in retry, timeout, JSON handling. Smaller than axios. | MEDIUM |

**Alternative:** Native fetch with wrapper

| Criterion | ky | axios | Native fetch |
|-----------|-----|-------|--------------|
| Bundle size | ~3KB | ~13KB | 0KB |
| API ergonomics | Excellent | Good | Verbose |
| Retry/timeout | Built-in | Plugin | Manual |
| TypeScript | Good | Good | Good |

**Recommendation:** ky for cleaner code. axios acceptable if team prefers. Avoid raw fetch - too verbose for production code.

### Client State (UI State)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Zustand** | ^4.x or ^5.x | UI state | Simple, minimal boilerplate, excellent TypeScript support. For UI-only state (theme, sidebar open, etc.). | HIGH |

**When to use Zustand vs TanStack Query:**
- Server data (sessions, documents, evaluations): TanStack Query
- UI state (sidebar open, theme, local preferences): Zustand
- Form state: React Hook Form (not global state)

**Why not Redux:** Overkill for SPA with TanStack Query handling server state. Redux adds unnecessary complexity.

**Why not Jotai/Recoil:** Atomic state is good but Zustand's store pattern is simpler for this use case.

### Forms

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **React Hook Form** | ^7.x | Form handling | Best performance (uncontrolled), excellent validation, minimal re-renders. | HIGH |
| **Zod** | ^3.x | Schema validation | Runtime validation + TypeScript inference. Integrates with React Hook Form via resolver. | HIGH |
| @hookform/resolvers | ^3.x | RHF + Zod bridge | Connects Zod schemas to React Hook Form. | HIGH |

**Pattern:**
```typescript
const schema = z.object({
  query: z.string().min(1, "Query required"),
  top_k: z.number().min(1).max(100).default(10),
  use_reranking: z.boolean().default(false),
})

type FormData = z.infer<typeof schema>

const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { top_k: 10, use_reranking: false }
})
```

### Data Tables

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **TanStack Table** | ^8.x | Headless table | Full control over rendering with shadcn/ui. Sorting, filtering, pagination built-in. | HIGH |

**shadcn/ui has a data-table component** that uses TanStack Table underneath. Use that as the base.

**Features needed for this project:**
- Evaluation results table (sorting by Hit@K, MRR)
- Document results table (source, score, metadata)
- Ingestion jobs list (status, progress)

### Real-time / WebSocket (Future)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Polling first** | N/A | Progress updates | Backend already has polling endpoints. Start here. | HIGH |
| Socket.io-client | ^4.x | WebSocket (if needed) | Only if polling proves insufficient for UX. | LOW (not needed initially) |

**Recommendation:** Use TanStack Query polling for ingestion progress initially. WebSocket is premature optimization until proven needed.

---

## shadcn/ui Components to Install

### Required Components (Day 1)

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Core layout
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add separator
npx shadcn@latest add scroll-area

# Navigation
npx shadcn@latest add navigation-menu
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs

# Forms
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add switch
npx shadcn@latest add slider
npx shadcn@latest add form

# Feedback
npx shadcn@latest add toast
npx shadcn@latest add progress
npx shadcn@latest add skeleton
npx shadcn@latest add alert

# Data display
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add avatar

# Overlays
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add tooltip
```

### Components by Feature

| Feature | Components Needed |
|---------|-------------------|
| Chat Interface | `scroll-area`, `textarea`, `button`, `avatar`, `skeleton` |
| Retrieval Testing | `input`, `select`, `switch`, `slider`, `card`, `table`, `badge` |
| Document Ingestion | `button`, `progress`, `card`, `toast`, `alert` |
| Evaluation Results | `table`, `badge`, `card`, `tabs` |
| Navigation | `navigation-menu`, `dropdown-menu`, `sheet` (mobile) |
| Settings | `form`, `input`, `select`, `switch`, `dialog` |

### Additional Components (Phase 2+)

```bash
# If needed later
npx shadcn@latest add command      # Command palette (Cmd+K)
npx shadcn@latest add popover      # Popovers
npx shadcn@latest add collapsible  # Collapsible sections
npx shadcn@latest add accordion    # FAQ/help sections
npx shadcn@latest add calendar     # Date filtering
npx shadcn@latest add date-picker  # Date selection
```

---

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Root component, providers
│   ├── routes/                  # TanStack Router routes
│   │   ├── __root.tsx           # Root layout
│   │   ├── index.tsx            # Dashboard home
│   │   ├── chat/
│   │   │   └── index.tsx        # Chat interface
│   │   ├── retrieve/
│   │   │   └── index.tsx        # Retrieval testing
│   │   ├── ingestion/
│   │   │   └── index.tsx        # Document ingestion
│   │   └── evaluations/
│   │       ├── index.tsx        # Evaluation list
│   │       └── $evaluationId.tsx # Evaluation detail
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (auto-generated)
│   │   ├── layout/              # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageContainer.tsx
│   │   ├── chat/                # Chat-specific components
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── SourcesList.tsx
│   │   ├── retrieval/           # Retrieval-specific components
│   │   ├── ingestion/           # Ingestion-specific components
│   │   └── evaluation/          # Evaluation-specific components
│   ├── hooks/                   # Custom hooks
│   │   ├── useChat.ts           # Chat mutation + session query
│   │   ├── useIngestion.ts      # Ingestion mutation + polling
│   │   └── useEvaluations.ts    # Evaluation queries
│   ├── lib/
│   │   ├── api/                 # API client
│   │   │   ├── client.ts        # ky instance with base config
│   │   │   ├── chat.ts          # Chat endpoints
│   │   │   ├── retrieval.ts     # Retrieval endpoints
│   │   │   ├── ingestion.ts     # Ingestion endpoints
│   │   │   └── evaluation.ts    # Evaluation endpoints
│   │   ├── utils.ts             # Utility functions (cn, etc.)
│   │   └── schemas/             # Zod schemas matching backend
│   │       ├── chat.ts
│   │       ├── retrieval.ts
│   │       ├── ingestion.ts
│   │       └── evaluation.ts
│   ├── stores/                  # Zustand stores
│   │   └── ui.ts                # UI state (theme, sidebar)
│   └── styles/
│       └── globals.css          # Tailwind directives, CSS variables
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts           # Or tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── components.json              # shadcn/ui config
└── package.json
```

---

## Installation Commands

```bash
# Create project
pnpm create vite frontend --template react-ts
cd frontend

# Core dependencies
pnpm add react react-dom

# Routing
pnpm add @tanstack/react-router

# Data fetching
pnpm add @tanstack/react-query @tanstack/react-query-devtools

# HTTP client
pnpm add ky

# Forms
pnpm add react-hook-form zod @hookform/resolvers

# State
pnpm add zustand

# Tables
pnpm add @tanstack/react-table

# Styling utilities
pnpm add tailwind-merge clsx

# Dev dependencies
pnpm add -D tailwindcss postcss autoprefixer
pnpm add -D @types/react @types/react-dom
pnpm add -D @tanstack/router-devtools
pnpm add -D @tanstack/router-vite-plugin  # If using file-based routing

# Initialize Tailwind
pnpm dlx tailwindcss init -p

# Initialize shadcn/ui
pnpm dlx shadcn@latest init
```

---

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| **Redux / Redux Toolkit** | Overkill. TanStack Query handles server state; Zustand handles UI state. Redux adds unnecessary boilerplate. |
| **axios** | ky is smaller with better defaults. axios acceptable if team strongly prefers it. |
| **Formik** | React Hook Form has better performance (uncontrolled inputs) and TypeScript support. |
| **Yup** | Zod provides better TypeScript inference. Yup is older pattern. |
| **CSS Modules** | Tailwind is specified in requirements. CSS Modules adds complexity. |
| **styled-components / Emotion** | Tailwind covers styling. CSS-in-JS adds runtime overhead. |
| **MobX** | More complex than Zustand for simple UI state. |
| **SWR** | TanStack Query is more fully-featured (mutations, DevTools). |
| **Next.js / Remix** | SPA requirements only. These add SSR complexity not needed. Vite is correct choice. |
| **Material UI / Ant Design / Chakra** | shadcn/ui specified. These are heavier, less customizable, impose design systems. |

---

## API Client Pattern

```typescript
// lib/api/client.ts
import ky from 'ky'

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ['get'],
  },
  hooks: {
    beforeError: [
      async (error) => {
        const { response } = error
        if (response) {
          const body = await response.json().catch(() => ({}))
          error.message = body.detail || response.statusText
        }
        return error
      }
    ]
  }
})

// lib/api/chat.ts
import { api } from './client'
import type { ChatRequest, ChatResponse } from '@/lib/schemas/chat'

export const chatApi = {
  send: (data: ChatRequest) =>
    api.post('chat', { json: data }).json<ChatResponse>(),

  getSession: (sessionId: string) =>
    api.get(`sessions/${sessionId}`).json(),
}
```

---

## Environment Variables

```bash
# .env.local (gitignored)
VITE_API_URL=http://localhost:8000

# .env.production
VITE_API_URL=https://api.yourdomain.com
```

---

## Verification Checklist (BEFORE IMPLEMENTATION)

These versions should be verified with current npm/official documentation:

| Package | Verify With | Notes |
|---------|-------------|-------|
| Vite | `npm view vite version` | Check for v6 release |
| React | `npm view react version` | Check for v19 stability |
| Tailwind CSS | `npm view tailwindcss version` | Check for v4 release |
| TanStack Query | `npm view @tanstack/react-query version` | Likely stable v5 |
| TanStack Router | `npm view @tanstack/react-router version` | Verify v1 stable |
| TanStack Table | `npm view @tanstack/react-table version` | Likely stable v8 |
| React Hook Form | `npm view react-hook-form version` | Likely stable v7 |
| Zod | `npm view zod version` | Likely stable v3 |
| Zustand | `npm view zustand version` | Check for v5 release |
| ky | `npm view ky version` | Likely stable v1 |
| shadcn/ui | Official docs | Not versioned, check init command |

---

## Sources & Confidence Notes

**HIGH Confidence (stable patterns):**
- React + TypeScript + Vite combination
- TanStack Query for server state
- React Hook Form + Zod for forms
- Zustand for UI state
- shadcn/ui component patterns
- TanStack Table for data tables

**MEDIUM Confidence (verify versions):**
- Specific version numbers (training data may be stale)
- TanStack Router vs React Router recommendation
- ky vs alternatives (team preference matters)

**LOW Confidence (needs verification):**
- React 19 compatibility with ecosystem
- Tailwind v4 migration status
- Vite 6 feature set

**Sources:**
- Training data (May 2025 cutoff) - treat as hypothesis
- Project requirements (Vite, React, TypeScript, Tailwind, shadcn/ui)
- Backend API analysis (router.py, schemas.py)

---

## Summary

| Category | Choice | Rationale |
|----------|--------|-----------|
| Build | Vite + TypeScript + pnpm | Fast DX, type safety, efficient packages |
| UI | React + Tailwind + shadcn/ui | Requirements + ownership over components |
| Routing | TanStack Router | Type-safe routes and search params |
| Server State | TanStack Query | Industry standard, caching, DevTools |
| Client State | Zustand | Simple, minimal boilerplate |
| Forms | React Hook Form + Zod | Performance + type inference |
| HTTP | ky | Clean API, small bundle |
| Tables | TanStack Table | Headless, works with shadcn/ui |

This stack optimizes for:
1. **Type safety** - End-to-end TypeScript
2. **Developer experience** - Fast feedback, good tooling
3. **Performance** - Minimal bundles, efficient re-renders
4. **Maintainability** - Clear patterns, component ownership
5. **Modern SaaS aesthetic** - shadcn/ui provides Linear/Notion-style defaults
