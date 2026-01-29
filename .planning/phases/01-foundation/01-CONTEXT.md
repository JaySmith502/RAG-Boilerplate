# Phase 1: Foundation - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffold with Vite + React + TypeScript, theme system with light/dark mode, layout shell with sidebar and header, and API infrastructure with TanStack Query. This phase delivers the application shell that all feature phases build on.

</domain>

<decisions>
## Implementation Decisions

### Layout Structure
- Header contains: logo/title on left, theme toggle and user area on right
- Header style: floating bar with subtle shadow (modern, stands off from content)
- Content area width: depends on section — Chat should be full width, other sections use max-width container (like Notion)

### Navigation Pattern
- Navigation lives in sidebar with icons + labels (Linear-style vertical nav)
- Active state: background highlight on the active nav item
- Icons: Lucide icons (shadcn default) — MessageSquare for Chat, Search for Retrieval, Upload for Ingestion, BarChart for Evaluation

### Theme Toggle
- Location: header right side, always visible
- Style: dropdown with 3 options (Light / Dark / System)
- Default for new users: system preference (match OS setting)

### Loading & Error Patterns
- Loading skeletons: shimmer/pulse animation on placeholder blocks
- Error display: both toast notification + inline error message (toast for notice, inline for details)
- Toast position: bottom right of screen

### Claude's Discretion
- Sidebar collapsibility (always visible vs collapsible to icons)
- URL routing strategy (/chat, /retrieval, etc. vs single-page)
- Theme transition animation (instant vs fade)
- Retry button logic (determine when retry makes sense for recoverable errors)

</decisions>

<specifics>
## Specific Ideas

- "Linear-style" sidebar navigation mentioned as reference
- "Notion-style" max-width container for non-chat content
- Modern SaaS aesthetic throughout (established in PROJECT.md)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-01-29*
