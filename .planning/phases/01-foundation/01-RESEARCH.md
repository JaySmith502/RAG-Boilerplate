# Phase 1: Foundation - Research

**Researched:** 2026-01-29
**Domain:** React SPA Scaffold with Theme System and API Infrastructure
**Confidence:** HIGH

## Summary

This research covers the specific implementation details for scaffolding a Vite + React + TypeScript project with Tailwind CSS v4, shadcn/ui components, a dark mode system without FOUC, and TanStack Query for API management. The ecosystem has matured significantly: Vite 7, React 19, and Tailwind v4 are all stable and well-documented.

The key implementation challenges are: (1) Tailwind v4's CSS-first configuration which differs substantially from v3, (2) preventing dark mode flash of unstyled content via inline script in index.html, and (3) properly structuring the layout shell with shadcn/ui's sidebar component.

**Primary recommendation:** Use `npm create vite@latest` with react-ts template, then `pnpm dlx shadcn@latest init` for component setup. Install the sidebar component from shadcn/ui for the Linear-style navigation. Implement FOUC prevention via inline script in index.html that runs before React hydrates.

## Standard Stack

The established libraries/tools for this phase:

### Core (Verified Versions as of 2026-01-29)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 7.3.1 | Build tool | Fast HMR, ES modules, industry standard for React SPAs |
| React | 19.2.4 | UI framework | Stable with concurrent features, large ecosystem |
| TypeScript | 5.x | Type safety | IDE support, catches errors early |
| Tailwind CSS | 4.1.18 | Utility CSS | CSS-first config, excellent DX |
| @tailwindcss/vite | latest | Vite plugin | Required for Tailwind v4 integration |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | 5.90.20 | Server state | All API data fetching |
| @tanstack/react-query-devtools | 5.x | Query debugging | Development only |
| lucide-react | 0.563.0 | Icons | All iconography (shadcn/ui default) |
| clsx | 2.x | Conditional classes | Class name composition |
| tailwind-merge | 2.x | Class merging | Resolving Tailwind class conflicts |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v4 | Tailwind v3 | v3 is more documented but v4 is current; shadcn/ui now defaults to v4 |
| pnpm | npm/yarn | pnpm is faster and disk-efficient; npm is simpler for beginners |
| lucide-react | react-icons | lucide is shadcn default with consistent styling |

**Installation:**
```bash
# Create project
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install core dependencies
pnpm add @tanstack/react-query @tanstack/react-query-devtools
pnpm add lucide-react clsx tailwind-merge

# Install Tailwind v4 for Vite
pnpm add tailwindcss @tailwindcss/vite

# Dev dependencies
pnpm add -D @types/node

# Initialize shadcn/ui (will prompt for configuration)
pnpm dlx shadcn@latest init
```

## Architecture Patterns

### Recommended Project Structure

```
frontend/
├── index.html              # FOUC prevention script lives here
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Root component with providers
│   ├── index.css          # Tailwind v4 CSS imports
│   ├── components/
│   │   ├── ui/            # shadcn/ui primitives (auto-generated)
│   │   ├── layout/        # Layout shell components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── page-container.tsx
│   │   │   └── mode-toggle.tsx
│   │   └── common/        # Shared components
│   │       ├── loading-skeleton.tsx
│   │       └── error-display.tsx
│   ├── lib/
│   │   ├── utils.ts       # cn() helper, formatters
│   │   ├── api-client.ts  # Typed fetch wrapper
│   │   └── query-client.ts # TanStack Query config
│   ├── providers/
│   │   └── theme-provider.tsx
│   └── features/          # Feature modules (built in later phases)
│       ├── chat/
│       ├── retrieval/
│       ├── ingestion/
│       └── evaluation/
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
└── components.json        # shadcn/ui config
```

### Pattern 1: FOUC Prevention with Inline Script

**What:** Prevent flash of wrong theme by applying theme class before React hydrates
**When to use:** Always, in index.html
**Example:**

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RAG Dashboard</title>
    <!-- FOUC Prevention: Apply theme BEFORE any CSS loads -->
    <script>
      (function() {
        const storageKey = 'vite-ui-theme';
        const theme = localStorage.getItem(storageKey);

        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // System preference (default)
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          }
        }
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Source:** [shadcn/ui Dark Mode Vite](https://ui.shadcn.com/docs/dark-mode/vite)

### Pattern 2: ThemeProvider with useTheme Hook

**What:** React context for theme state management
**When to use:** Wrap root component, use hook in mode toggle

```typescript
// src/providers/theme-provider.tsx
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
```

**Source:** [shadcn/ui Dark Mode Vite](https://ui.shadcn.com/docs/dark-mode/vite)

### Pattern 3: Tailwind v4 CSS Configuration

**What:** CSS-first configuration replacing tailwind.config.js
**When to use:** All Tailwind v4 projects

```css
/* src/index.css */
@import "tailwindcss";

/* CSS variables for shadcn/ui theming */
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(222.2 84% 4.9%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(222.2 84% 4.9%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(222.2 84% 4.9%);
  --primary: hsl(222.2 47.4% 11.2%);
  --primary-foreground: hsl(210 40% 98%);
  --secondary: hsl(210 40% 96.1%);
  --secondary-foreground: hsl(222.2 47.4% 11.2%);
  --muted: hsl(210 40% 96.1%);
  --muted-foreground: hsl(215.4 16.3% 46.9%);
  --accent: hsl(210 40% 96.1%);
  --accent-foreground: hsl(222.2 47.4% 11.2%);
  --destructive: hsl(0 84.2% 60.2%);
  --destructive-foreground: hsl(210 40% 98%);
  --border: hsl(214.3 31.8% 91.4%);
  --input: hsl(214.3 31.8% 91.4%);
  --ring: hsl(222.2 84% 4.9%);
  --radius: 0.5rem;
  --sidebar-background: hsl(0 0% 100%);
  --sidebar-foreground: hsl(222.2 84% 4.9%);
  --sidebar-primary: hsl(222.2 47.4% 11.2%);
  --sidebar-primary-foreground: hsl(210 40% 98%);
  --sidebar-accent: hsl(210 40% 96.1%);
  --sidebar-accent-foreground: hsl(222.2 47.4% 11.2%);
  --sidebar-border: hsl(214.3 31.8% 91.4%);
  --sidebar-ring: hsl(222.2 84% 4.9%);
}

.dark {
  --background: hsl(222.2 84% 4.9%);
  --foreground: hsl(210 40% 98%);
  --card: hsl(222.2 84% 4.9%);
  --card-foreground: hsl(210 40% 98%);
  --popover: hsl(222.2 84% 4.9%);
  --popover-foreground: hsl(210 40% 98%);
  --primary: hsl(210 40% 98%);
  --primary-foreground: hsl(222.2 47.4% 11.2%);
  --secondary: hsl(217.2 32.6% 17.5%);
  --secondary-foreground: hsl(210 40% 98%);
  --muted: hsl(217.2 32.6% 17.5%);
  --muted-foreground: hsl(215 20.2% 65.1%);
  --accent: hsl(217.2 32.6% 17.5%);
  --accent-foreground: hsl(210 40% 98%);
  --destructive: hsl(0 62.8% 30.6%);
  --destructive-foreground: hsl(210 40% 98%);
  --border: hsl(217.2 32.6% 17.5%);
  --input: hsl(217.2 32.6% 17.5%);
  --ring: hsl(212.7 26.8% 83.9%);
  --sidebar-background: hsl(222.2 84% 4.9%);
  --sidebar-foreground: hsl(210 40% 98%);
  --sidebar-primary: hsl(210 40% 98%);
  --sidebar-primary-foreground: hsl(222.2 47.4% 11.2%);
  --sidebar-accent: hsl(217.2 32.6% 17.5%);
  --sidebar-accent-foreground: hsl(210 40% 98%);
  --sidebar-border: hsl(217.2 32.6% 17.5%);
  --sidebar-ring: hsl(212.7 26.8% 83.9%);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar-background: var(--sidebar-background);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

**Source:** [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)

### Pattern 4: TanStack Query Provider Setup

**What:** Configure QueryClient and wrap app
**When to use:** App initialization

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

```typescript
// src/App.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query-client'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        {/* App content */}
        <Toaster position="bottom-right" />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**Source:** [TanStack Query Quick Start](https://tanstack.com/query/v5/docs/framework/react/quick-start)

### Pattern 5: Mode Toggle with Dropdown

**What:** Theme switcher component with Light/Dark/System options
**When to use:** Header navigation

```typescript
// src/components/layout/mode-toggle.tsx
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/providers/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Source:** [shadcn/ui Dark Mode Vite](https://ui.shadcn.com/docs/dark-mode/vite)

### Anti-Patterns to Avoid

- **Theme state in React only:** Causes FOUC because React hydrates after initial paint. Always use inline script.
- **Tailwind v3 config patterns in v4:** No tailwind.config.js in v4; configuration is CSS-first.
- **Importing all Lucide icons:** Import only what you need; tree-shaking depends on named imports.
- **Global CSS variables without @theme inline:** Tailwind v4 requires @theme inline directive for CSS variable exposure.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme toggle | Custom toggle logic | shadcn/ui dropdown-menu + useTheme | Handles edge cases (system preference changes) |
| Sidebar navigation | Custom sidebar | shadcn/ui sidebar component | Handles collapsible, responsive, keyboard shortcuts (Cmd+B) |
| Toast notifications | Custom toast system | shadcn/ui sonner | Positioning, stacking, animations, accessibility |
| Loading skeletons | Custom shimmer CSS | shadcn/ui skeleton | Consistent with design system |
| API client | Raw fetch() calls | Typed wrapper + TanStack Query | Error handling, caching, race conditions |

**Key insight:** shadcn/ui provides a complete sidebar component with collapsible modes, keyboard shortcuts, and cookie persistence. Use it instead of building custom navigation.

## Common Pitfalls

### Pitfall 1: Dark Mode FOUC

**What goes wrong:** Page loads in light mode, then flashes to dark mode after React hydrates
**Why it happens:** Theme state is in React, which runs after HTML/CSS is parsed
**How to avoid:** Add inline script in `<head>` of index.html that sets class on `<html>` before any CSS loads
**Warning signs:** Brief white flash on page load for dark mode users

### Pitfall 2: Tailwind v4 Configuration Confusion

**What goes wrong:** Trying to use tailwind.config.js or postcss.config.js patterns from v3
**Why it happens:** Most tutorials and Stack Overflow answers are for v3
**How to avoid:** Use @tailwindcss/vite plugin, CSS-first config with @theme inline directive
**Warning signs:** "Unknown at rule @theme" errors, config file being ignored

### Pitfall 3: Wrong shadcn/ui Version

**What goes wrong:** Components don't work, type errors, CSS issues
**Why it happens:** Using old shadcn CLI or init command
**How to avoid:** Use `pnpm dlx shadcn@latest init` (not @canary unless specifically needed)
**Warning signs:** Missing data-slot attributes, forwardRef still required

### Pitfall 4: Missing Path Aliases

**What goes wrong:** "@/components/..." imports fail
**Why it happens:** TypeScript and Vite need separate path alias configuration
**How to avoid:** Configure paths in BOTH tsconfig.json AND vite.config.ts
**Warning signs:** "Cannot find module" errors with @ paths

### Pitfall 5: TanStack Query v5 Breaking Changes

**What goes wrong:** Using isLoading instead of isPending
**Why it happens:** v5 renamed loading state to pending
**How to avoid:** Use isPending, not isLoading; use status === 'pending'
**Warning signs:** isLoading always false, components don't show loading state

## Code Examples

### Vite Configuration for Tailwind v4

```typescript
// vite.config.ts
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

**Source:** [shadcn/ui Vite Installation](https://ui.shadcn.com/docs/installation/vite)

### TypeScript Configuration with Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### API Client Base

```typescript
// src/lib/api-client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public originalError?: unknown
  ) {
    super(detail)
    this.name = 'ApiError'
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    let detail = 'Unknown error'
    try {
      const errorData = await response.json()
      detail = errorData.detail || JSON.stringify(errorData)
    } catch {
      detail = response.statusText
    }
    throw new ApiError(response.status, detail)
  }

  return response.json()
}
```

### Sidebar Navigation (Linear-style)

```typescript
// src/components/layout/app-sidebar.tsx
import { MessageSquare, Search, Upload, BarChart } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Chat", icon: MessageSquare, href: "/chat" },
  { title: "Retrieval", icon: Search, href: "/retrieval" },
  { title: "Ingestion", icon: Upload, href: "/ingestion" },
  { title: "Evaluation", icon: BarChart, href: "/evaluation" },
]

export function AppSidebar() {
  // Get current path for active state
  const currentPath = window.location.pathname

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === item.href}
                  >
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

**Source:** [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar)

## shadcn/ui Components Required for Phase 1

Install these components for the foundation phase:

```bash
# Core layout
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add sidebar
pnpm dlx shadcn@latest add dropdown-menu

# Feedback
pnpm dlx shadcn@latest add sonner
pnpm dlx shadcn@latest add skeleton

# Typography/display
pnpm dlx shadcn@latest add separator
```

| Component | Purpose in Phase 1 |
|-----------|-------------------|
| button | Theme toggle trigger, general actions |
| sidebar | Linear-style navigation shell |
| dropdown-menu | Theme toggle menu (Light/Dark/System) |
| sonner | Toast notifications (bottom right) |
| skeleton | Loading states (shimmer/pulse) |
| separator | Visual dividers in layout |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js | CSS-first @theme directive | Tailwind v4 (2024) | No config file needed |
| Create React App | Vite | CRA deprecated 2023 | Faster builds, ES modules |
| forwardRef in components | Standard props with data-slot | shadcn/ui 2024 | Simpler component APIs |
| isLoading in TanStack Query | isPending | TanStack Query v5 | Semantic clarity |
| tailwindcss-animate | tw-animate-css | shadcn/ui late 2024 | Updated animation package |

**Deprecated/outdated:**
- Create React App: Deprecated, use Vite
- tailwind.config.js: v3 pattern, v4 uses CSS-first
- next-themes for Vite: Use custom ThemeProvider pattern instead

## Open Questions

Things that couldn't be fully resolved:

1. **Sidebar collapsibility default**
   - What we know: shadcn/ui sidebar supports `offcanvas`, `icon`, and `none` modes
   - What's unclear: Whether to default to always-visible or collapsible based on user's decision context
   - Recommendation: Start with always-visible (`none` mode), add collapsibility if screen space becomes issue

2. **URL routing implementation**
   - What we know: CONTEXT.md left URL strategy as Claude's discretion
   - What's unclear: Whether to use TanStack Router or React Router
   - Recommendation: Use TanStack Router for type-safe routes; both work well

## Sources

### Primary (HIGH confidence)
- [shadcn/ui Vite Installation](https://ui.shadcn.com/docs/installation/vite) - scaffold and component setup
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) - CSS-first configuration
- [shadcn/ui Dark Mode Vite](https://ui.shadcn.com/docs/dark-mode/vite) - ThemeProvider and FOUC prevention
- [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar) - navigation component
- [TanStack Query Quick Start](https://tanstack.com/query/v5/docs/framework/react/quick-start) - setup pattern
- [Lucide React](https://lucide.dev/guide/packages/lucide-react) - icon usage

### Secondary (MEDIUM confidence)
- npm version verification (Vite 7.3.1, React 19.2.4, Tailwind 4.1.18, TanStack Query 5.90.20)
- [Vite Getting Started](https://vite.dev/guide/) - scaffold command

### Tertiary (LOW confidence)
- None - all critical patterns verified with official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified versions via npm, official docs
- Architecture: HIGH - official shadcn/ui and TanStack patterns
- Pitfalls: HIGH - documented in official migration guides

**Research date:** 2026-01-29
**Valid until:** 60 days (stack is stable, Tailwind v4 is production-ready)
