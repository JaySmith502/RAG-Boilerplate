# Phase 6: Design Polish - Research

**Researched:** 2026-01-29
**Domain:** CSS/UI Design, Tailwind CSS v4, shadcn/ui
**Confidence:** HIGH

## Summary

This research analyzes the current state of the RAG Boilerplate frontend to identify design polish opportunities against the DSGN-01 through DSGN-06 requirements. The codebase already uses shadcn/ui new-york style with Tailwind v4 and oklch colors - a solid foundation that needs targeted refinements rather than wholesale changes.

The existing implementation is approximately 70% aligned with the requirements. The main gaps are: inconsistent shadow usage across Cards (some use `shadow-sm`, tables have none), inconsistent rounded corner patterns (buttons use `rounded-md`, cards use `rounded-xl`), missing visual hierarchy between nested elements, and no explicit tablet breakpoint handling.

**Primary recommendation:** Focus polish efforts on three areas: (1) standardize shadow/elevation tokens, (2) audit and fix border-radius consistency, (3) add responsive adjustments at the `md` breakpoint.

## Current State Analysis

### CSS Variable Structure (index.css)

The existing color system is well-structured with proper dark mode hierarchy:

| Token | Light Value | Dark Value | Purpose |
|-------|-------------|------------|---------|
| `--background` | `oklch(1 0 0)` | `oklch(0.16 0.01 250)` | Page background |
| `--card` | `oklch(1 0 0)` | `oklch(0.19 0.005 250)` | Card surfaces |
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.13 0.01 250)` | Sidebar background |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.24 0.005 250)` | Secondary surfaces |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Borders |

**Finding:** Dark mode uses blue hue (250) for visual depth - this is a deliberate decision documented in STATE.md. The hierarchy (sidebar < background < card) is correct for Linear/Notion aesthetic.

### Component Inventory

| Component | Shadow | Border Radius | Notes |
|-----------|--------|---------------|-------|
| Card | `shadow-sm` | `rounded-xl` | Good baseline |
| Button | none | `rounded-md` | Inconsistent with card |
| Input | `shadow-xs` | `rounded-md` | Matches button |
| Table container | none | `rounded-lg` (via wrapper) | Missing shadow |
| Badge | none | `rounded-full` | Appropriate for pills |
| MessageBubble | none | `rounded-2xl` / `rounded-br-md` | Custom, appropriate |
| Progress | none | `rounded-full` | Appropriate |

### Layout Patterns

| Page | Container | Width Constraint | Notes |
|------|-----------|------------------|-------|
| Chat | `PageContainer fullWidth` | None | Correct per STATE.md |
| Retrieval | `PageContainer` | `max-w-5xl` | Correct |
| Ingestion | `PageContainer` | `max-w-5xl` | Correct |
| Evaluation | `PageContainer` | `max-w-5xl` | Correct |

### Responsive Patterns in Use

Current responsive utilities found in codebase:
- `md:text-sm` - Text sizing
- `md:grid-cols-2` - Grid layouts
- `md:flex` - Visibility
- `hidden md:block` - Mobile hiding

**Gap:** No explicit tablet (768px-1024px) handling. The `md` breakpoint is used but not consistently applied across all layouts.

## Standard Stack

The project already uses the correct stack:

### Core
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Tailwind CSS | 4.1.18 | Utility CSS | Installed |
| shadcn/ui | new-york | Components | Installed |
| tw-animate-css | 1.4.0 | Animations | Installed |
| class-variance-authority | - | Variant styling | Installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx/cn | via lib/utils | Class merging | Already in use |
| lucide-react | - | Icons | Already in use |

**No new dependencies needed.** All polish work uses existing tooling.

## Architecture Patterns

### Elevation Scale (New)

Define a consistent elevation scale in CSS variables:

```css
@theme inline {
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
```

| Level | Use Case | Class |
|-------|----------|-------|
| 0 | Inset/recessed | No shadow |
| 1 | Cards, dropdowns | `shadow-sm` |
| 2 | Floating elements | `shadow-md` |
| 3 | Modals, overlays | `shadow-lg` |

### Border Radius Scale

Standardize on shadcn's radius scale:

| Element Type | Radius | Class |
|--------------|--------|-------|
| Buttons, inputs | `var(--radius)` | `rounded-md` (0.375rem) |
| Cards, panels | `var(--radius-lg)` | `rounded-xl` (0.625rem) |
| Pills, badges | 9999px | `rounded-full` |
| Tables | `var(--radius-lg)` | `rounded-lg` |

### Visual Hierarchy Pattern

For nested card content:

```
Card (bg-card, shadow-sm, rounded-xl, border)
  └── Content area (no background, p-6)
       └── Muted section (bg-muted, rounded-lg, p-4)
            └── Input field (bg-background, border, rounded-md)
```

### Responsive Layout Pattern

Use consistent breakpoint handling:

```tsx
// Form grid that stacks on mobile, 2-col on tablet+
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Card grid that adjusts columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Content max-width with padding
<div className="max-w-5xl mx-auto px-4 md:px-6">
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode shadows | Custom shadow values for each theme | CSS `color-mix()` or opacity-based shadows | Tailwind shadows already work in dark mode |
| Custom animations | CSS keyframes from scratch | tw-animate-css classes | Already installed, consistent timing |
| Custom focus states | Manual focus ring styles | shadcn components with built-in `focus-visible:ring` | Accessibility baked in |
| Responsive hiding | Complex JS breakpoint detection | `hidden md:block` utilities | Tailwind handles this |

## Gap Analysis

### DSGN-01: Modern SaaS aesthetic (Linear/Notion-inspired)

**Current:** 80% achieved
- Good: Dark theme with blue tint, clean typography, proper spacing
- Gap: Header could use more polish (currently plain `border-b`)
- Gap: Sidebar lacks visual distinction for active states

### DSGN-02: Card-based layouts with subtle shadows

**Current:** 60% achieved
- Good: Card component has `shadow-sm`
- Gap: Tables wrapped in `border rounded-lg` but no shadow
- Gap: MetricCard in evaluation has `bg-card` but uses generic border
- Gap: Error state cards inconsistent (some `bg-destructive/10`, some with card wrapper)

### DSGN-03: Rounded corners on all interactive elements

**Current:** 70% achieved
- Good: Buttons, inputs, cards all have rounded corners
- Gap: Some components use different radius values
- Gap: Table cells don't have rounded corners on hover states

### DSGN-04: Clear visual hierarchy between containers and inputs

**Current:** 60% achieved
- Good: Card/muted/background distinction exists in CSS
- Gap: Nested sections don't consistently use hierarchy
- Gap: Form sections within cards blend together
- Gap: `bg-muted/50` vs `bg-muted` used inconsistently

### DSGN-05: Consistent spacing and typography

**Current:** 80% achieved
- Good: Most components use `space-y-6` pattern
- Gap: Some inconsistency in padding (`p-4` vs `p-6`)
- Gap: Header typography could be stronger (`text-2xl font-semibold` used, could be bolder)

### DSGN-06: Responsive layout for desktop and tablet

**Current:** 50% achieved
- Good: Grid layouts use `md:grid-cols-2`
- Gap: Chat input area not responsive
- Gap: Tables don't adapt well to tablet width
- Gap: Sidebar mobile behavior relies on shadcn default (sheet), needs verification

## Common Pitfalls

### Pitfall 1: Inconsistent Dark Mode Shadows
**What goes wrong:** Shadows that look good in light mode become invisible or harsh in dark mode
**Why it happens:** Using fixed RGB shadows without considering dark theme
**How to avoid:** Use Tailwind's built-in shadow utilities (they're opacity-based) or use `shadow-[color]/opacity` pattern
**Warning signs:** Shadows look "flat" or "floating" in dark mode

### Pitfall 2: Over-nesting Radius
**What goes wrong:** Inner rounded corners create visual gaps when nested
**Why it happens:** Inner element's radius doesn't account for parent padding
**How to avoid:** Use consistent radius scale; inner elements can use smaller radius
**Warning signs:** White/gap corners visible between nested rounded elements

### Pitfall 3: Breaking Visual Hierarchy on Hover
**What goes wrong:** Hover states that elevate elements above their intended hierarchy
**Why it happens:** Adding `hover:shadow-lg` to elements that should stay at level 1
**How to avoid:** Hover should only increase one elevation level
**Warning signs:** Cards "jumping" out of their containers on hover

### Pitfall 4: Tablet Breakpoint Neglect
**What goes wrong:** Layouts jump from mobile directly to desktop
**Why it happens:** Only testing on phone and desktop, skipping tablet
**How to avoid:** Test at 768px-1024px range; ensure 2-column grids work
**Warning signs:** Content too cramped at 800px, too sparse at 1200px

## Code Examples

### Shadow Consistency Pattern
```tsx
// Tables should match Card shadow treatment
<div className="border rounded-lg shadow-sm overflow-hidden">
  <Table>...</Table>
</div>
```

### Nested Card Hierarchy
```tsx
<Card>
  <CardContent className="space-y-4">
    {/* Recessed section */}
    <div className="bg-muted rounded-lg p-4">
      {/* Input at background level */}
      <Input className="bg-background" />
    </div>
  </CardContent>
</Card>
```

### Responsive Form Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
  <div className="space-y-2">
    <Label>Field 1</Label>
    <Input />
  </div>
  <div className="space-y-2">
    <Label>Field 2</Label>
    <Input />
  </div>
</div>
```

### Consistent Error State Pattern
```tsx
// Use Card component for error states
<Card className="border-destructive/50 bg-destructive/10">
  <CardContent className="pt-6">
    <div className="flex items-center gap-3">
      <XCircle className="h-5 w-5 text-destructive" />
      <div>
        <p className="font-medium text-destructive">Error title</p>
        <p className="text-sm text-destructive/80">Error details</p>
      </div>
    </div>
  </CardContent>
</Card>
```

## Specific File Fixes Needed

### High Priority (DSGN-02, DSGN-04)

| File | Issue | Fix |
|------|-------|-----|
| `ResultsTable.tsx` | Table wrapper lacks shadow | Add `shadow-sm` to `div.border.rounded-lg` |
| `ComparisonTable.tsx` | Table wrapper lacks shadow | Add `shadow-sm` to `div.border.rounded-lg` |
| `JobHistoryTable.tsx` | Table has no wrapper | Wrap in `div.border.rounded-lg.shadow-sm` |
| `ResultsDisplay.tsx` | MetricCard border inconsistent | Standardize border treatment |
| `IngestionPage.tsx` | Job status section uses `bg-muted/50` inline | Extract to consistent pattern |

### Medium Priority (DSGN-03, DSGN-05)

| File | Issue | Fix |
|------|-------|-----|
| `header.tsx` | Plain border, no shadow | Add subtle shadow-sm, consider sticky blur |
| `ChatSessionList.tsx` | Session items could use hover states | Add subtle `hover:bg-muted/50` |
| Page headers | `text-2xl font-semibold` | Could use `text-3xl font-bold` for more impact |

### Lower Priority (DSGN-06)

| File | Issue | Fix |
|------|-------|-----|
| `MessageInput.tsx` | `max-w-4xl` fixed | Verify works at tablet width |
| `RetrievalForm.tsx` | Grid already responsive | Verify gap-6 at tablet |
| `EvaluationPage.tsx` | Multiple cards stack | Verify spacing at tablet |

## Open Questions

1. **Header enhancement scope**
   - What we know: Currently minimal (border-b only)
   - What's unclear: Should we add breadcrumbs, search, or keep minimal?
   - Recommendation: Keep minimal but add subtle shadow for depth

2. **Sidebar footer**
   - What we know: SidebarFooter component exists but not used
   - What's unclear: Should version/branding go there?
   - Recommendation: Defer unless user requests

## Sources

### Primary (HIGH confidence)
- Tailwind CSS v4.0 Documentation: https://tailwindcss.com/docs/theme
- shadcn/ui Official: https://ui.shadcn.com/
- Codebase analysis (direct file inspection)

### Secondary (MEDIUM confidence)
- Linear Design Trend: https://blog.logrocket.com/ux-design/linear-design/
- Tailwind Breakpoints: https://tailwindcss.com/docs/responsive-design
- OKLCH Color Guide: https://tailwindcolor.com/

### Tertiary (LOW confidence)
- SaaS UI Design Patterns: https://www.eleken.co/blog-posts/screen-design-examples

## Metadata

**Confidence breakdown:**
- Current state analysis: HIGH - Direct file inspection
- Gap analysis: HIGH - Compared against requirements
- Fix recommendations: MEDIUM - Based on shadcn patterns and best practices
- Responsive improvements: MEDIUM - Based on Tailwind documentation

**Research date:** 2026-01-29
**Valid until:** 30 days (stable technology, no breaking changes expected)
