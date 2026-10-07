# React + TypeScript + Vite Frontend Skill

## Stack

This project uses:

- React
- TypeScript
- Vite
- Material UI (MUI)
- React Router
- Lucide React
- CSS Modules

The repository is the source of truth. If an established repository pattern conflicts with a recommendation here, follow the repository unless the task explicitly requires otherwise.

---

## Core Principles

For every task:

1. Inspect before editing.
2. Search before creating.
3. Reuse before duplicating.
4. Make the smallest change that solves the task.
5. Preserve existing behavior.
6. Follow existing project patterns.
7. Do not modify unrelated code.
8. Do not add dependencies unless necessary.
9. Do not change architecture without explicit need.
10. Validate before finishing.

Avoid speculative abstractions and premature refactoring.

---

## Before Editing

Inspect only the relevant parts of the repository.

Check for existing:

- Components
- Pages/layouts
- Hooks
- Services/API clients
- Types
- Utilities
- Routes
- Form patterns
- MUI theme/configuration
- CSS Modules
- State patterns

Search before creating any new shared abstraction.

Do not reorganize folders or refactor working code unless required by the task.

---

## TypeScript

Use strict TypeScript.

### Required

- Define clear types for non-trivial data and component props.
- Prefer inference when types are obvious.
- Reuse existing domain types.
- Model finite states with unions where appropriate.
- Handle nullable/optional values explicitly.

### Avoid

- `any`
- `@ts-ignore`
- unnecessary type assertions
- duplicated interfaces
- broad types when precise types are practical

Use `unknown` instead of `any` for untrusted data and narrow it safely.

---

## React

Use functional components.

Prefer:

- Small, focused components
- Composition
- Local state
- Derived values
- Event handlers
- Existing hooks/components

Avoid:

- Giant components
- Excessive component fragmentation
- Duplicated state
- Unnecessary `useEffect`
- Premature `useMemo`
- Premature `useCallback`
- Premature `React.memo`

Before adding state, ask:

1. Does this value already exist?
2. Can it be derived?
3. Does an existing hook provide it?
4. What is the closest component that actually needs to own it?

Keep state as close to usage as practical.

---

## Material UI

Use MUI for standard UI primitives.

Example:

```tsx
import { Button, Stack, Typography } from "@mui/material";
```

Prefer existing project components before raw MUI components when an established wrapper already exists.

Use the existing MUI theme.

Prefer semantic theme values:

```tsx
<Box
  sx={{
    color: "text.secondary",
    bgcolor: "background.paper",
  }}
/>
```

Use theme:

- Palette
- Typography
- Spacing
- Breakpoints
- Shape
- Shadows
- Component variants

Avoid hardcoded visual values when a suitable theme token exists.

Use `sx` for small/local MUI styling.

Do not recreate MUI functionality unnecessarily.

---

## CSS Modules

Use CSS Modules for component-specific or more complex styling.

```text
UserCard.tsx
UserCard.module.css
```

```tsx
import styles from "./UserCard.module.css";

<div className={styles.card} />
```

Rules:

- Use `.module.css`.
- Keep selectors shallow.
- Use semantic class names.
- Avoid global CSS unless the style is genuinely global.
- Avoid large `style={{ ... }}` objects.

Good:

```css
.card {}
.header {}
.title {}
.actions {}
```

Avoid:

```css
.redBox {}
.bigThing {}
.leftDiv {}
```

Do not move simple MUI theme-based styling into CSS Modules unnecessarily.

---

## MUI vs CSS Modules

Use **MUI `sx`** for:

- Theme-aware colors
- Spacing
- Breakpoints
- Simple layout
- Small component states

Use **CSS Modules** for:

- Complex selectors
- Larger component styling
- Custom animations
- Complex responsive behavior
- Styling that is awkward in `sx`

Follow existing repository conventions when they differ.

---

## Icons

Use `lucide-react`.

```tsx
import { Search, Plus, Trash2 } from "lucide-react";
```

```tsx
<Search size={20} />
```

Do not:

- Install another icon library
- Create SVG icons when Lucide already provides one
- Use emoji as standard UI icons

Icon-only controls require an accessible name:

```tsx
<IconButton aria-label="Delete user">
  <Trash2 size={18} />
</IconButton>
```

Import only icons actually used.

---

## Routing

Use React Router for application navigation.

```tsx
import { Link, useNavigate } from "react-router-dom";
```

Prefer:

```tsx
<Link to="/users">Users</Link>
```

or:

```tsx
const navigate = useNavigate();
navigate("/users");
```

Do not use `window.location` for normal internal navigation.

Reuse existing:

- Route configuration
- Route constants
- Layout routes
- Navigation helpers

Do not restructure routing for a small feature.

---

## State Management

Use the simplest state solution appropriate to the task.

Prefer local React state for local UI concerns.

Examples:

- Active tab
- Form step
- Modal state
- Filters
- Counters
- Temporary selections

Do not introduce:

- Redux
- Zustand
- React Query
- Context-based global state
- another state library

unless explicitly requested or already established in the repository.

Do not create global state solely for convenience.

---

## API & Data Fetching

Before creating API code, inspect existing:

- API client
- Services
- Hooks
- Error handling
- Request/response types
- Environment configuration

Reuse existing patterns.

Do not create duplicate API abstractions.

Handle relevant states:

- Loading
- Success
- Error
- Empty

Do not silently swallow errors.

Bad:

```ts
try {
  await save();
} catch {
}
```

Use the project's existing error/notification pattern.

Do not expose raw internal/server errors directly to users.

---

## Secrets & Environment Variables

Never hardcode secrets in frontend code.

Never expose private API keys through Vite client variables unless the API explicitly considers the key public/browser-safe.

Secrets must not appear in:

- Components
- Client services
- Source-controlled config
- Logs
- URLs
- Mock data

Use the project's secure backend/server boundary for secret-dependent APIs.

`.env.example` may contain variable names, never real secret values.

---

## Forms

Reuse existing:

- Form components
- Validation utilities
- Form libraries
- Error patterns

Do not introduce a form library unless necessary.

Forms should:

- Validate useful constraints
- Display actionable error messages
- Preserve valid user input
- Prevent duplicate submissions where relevant
- Use appropriate labels/autocomplete
- Keep state simple

Do not validate aggressively before user interaction unless existing UX does so.

---

## Accessibility

All interactive UI must be keyboard accessible.

Required:

- Semantic HTML
- Proper form labels
- Visible focus states
- Accessible icon-only buttons
- Useful image `alt`
- Sufficient contrast
- Appropriate button/link semantics

Do not rely only on color to communicate state.

Use ARIA only when native semantics are insufficient.

---

## Responsive UI

Every user-facing feature must support:

- Mobile
- Tablet
- Desktop

Prefer MUI breakpoints for straightforward responsive behavior:

```tsx
<Box
  sx={{
    display: {
      xs: "block",
      md: "flex",
    },
  }}
/>
```

Use CSS Modules when responsive behavior becomes complex.

Avoid:

- Unnecessary fixed widths
- Page-level horizontal overflow
- Tiny touch targets
- Desktop-only interactions

Test narrow layouts before finishing.

---

## Naming

Use:

- `PascalCase` — components/types when appropriate
- `camelCase` — variables/functions
- `UPPER_SNAKE_CASE` — true constants
- `.module.css` — CSS Modules

Examples:

```text
UserProfile.tsx
UserProfile.module.css
useUserProfile.ts
userService.ts
```

Use names based on responsibility, not visual appearance.

---

## Imports

Keep imports clean.

- Remove unused imports.
- Use configured path aliases.
- Follow repository import ordering.
- Avoid unnecessary barrel files.
- Import only what is used.

---

## Lists

Use stable keys.

```tsx
users.map((user) => (
  <UserCard key={user.id} user={user} />
));
```

Do not use array indexes when a stable identifier exists.

---

## Performance

Prefer simple, readable code.

Avoid:

- Premature memoization
- Duplicate requests
- Duplicate state
- Expensive work during render
- Unnecessary effects
- Heavy dependencies for trivial functionality
- Over-engineered abstractions

Optimize only when there is a real reason.

---

## Reuse Checklist

Before creating a new:

- Button
- Input
- Card
- Modal/Dialog
- Dropdown
- Hook
- Utility
- API service
- Type
- Layout
- Icon wrapper

search the repository first.

Reuse existing implementations when they appropriately solve the problem.

Do not force reuse when it creates a worse abstraction.

---

## Scope Control

Implement only the requested feature.

Do not automatically add adjacent features.

Do not:

- Refactor unrelated code
- Rename unrelated files/components
- Reformat unrelated files
- Upgrade dependencies
- Replace libraries
- Reorganize folders
- Introduce speculative infrastructure

Small incidental fixes are acceptable only when necessary for the requested feature.

---

## Dependencies

Before installing a package, verify the capability does not already exist through:

1. Current project dependencies
2. React
3. MUI
4. Lucide
5. Existing utilities

Add a dependency only when it materially improves the implementation and cannot reasonably be achieved with the current stack.

Never add a dependency solely for convenience.

---

## Implementation Workflow

### 1. Inspect

Read relevant files and understand:

- Existing implementation
- Theme
- Routes
- State
- Services
- Types
- Styles

### 2. Search

Look for reusable:

- Components
- Hooks
- Utilities
- Types
- Services
- Styles
- Routes

### 3. Implement

Make the smallest maintainable change.

Follow existing patterns.

Keep the implementation focused.

### 4. Validate

Run available checks when appropriate:

```bash
npm run lint
npm run build
```

Also run project-specific type/test commands if configured.

Check:

- TypeScript errors
- Lint errors
- Broken imports
- Broken routes
- Runtime errors
- Responsive behavior
- Accessibility
- Existing related flows

Never claim a command passed unless it was executed.

### 5. Review

Before finishing verify:

- No unused imports
- No dead code
- No accidental `any`
- No debug logging
- No unrelated modifications
- No unnecessary dependencies
- Existing behavior remains intact
- Theme conventions are followed
- Navigation uses React Router
- Icons use Lucide
- Responsive behavior works

---

## Claude Code Behavior

When implementing tasks:

- Inspect before editing.
- Search before creating.
- Reuse before duplicating.
- Prefer repository conventions.
- Keep changes minimal.
- Keep code readable.
- Preserve existing behavior.
- Stay within requested scope.
- Avoid speculative abstractions.
- Do not rewrite working code for stylistic preference.
- Do not create commits unless explicitly requested.

When requirements are ambiguous, inspect existing patterns before inventing a new convention.

If a safe, obvious interpretation exists, proceed with the smallest implementation rather than expanding scope.

---

## Completion Response

After meaningful implementation work, report concisely:

### Summary
What changed.

### Files Changed
Files created/modified and why.

### Reused
Important existing components, services, types, theme patterns, or utilities reused.

### Validation
Commands/checks actually performed and their results.

### Scope
Any requested item intentionally deferred or anything important still mocked.

### Suggested Commit
Provide one concise commit message when useful.

Do not claim unexecuted validation.

---

## Definition of Done

A task is complete when:

- Requested functionality works.
- Existing behavior is preserved.
- TypeScript is valid.
- Lint passes when configured.
- Build passes when practical.
- Existing patterns are followed.
- MUI/theme conventions are respected.
- CSS Modules are used appropriately.
- Lucide is used for icons.
- React Router handles internal navigation.
- Accessibility is considered.
- Responsive behavior is verified.
- No unnecessary dependency was added.
- No unrelated code was modified.
- No secrets were exposed.
- The solution is no more complex than necessary.