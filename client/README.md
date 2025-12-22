# Client

This document defines the unified client architecture for the project.

## Core Principles

- Feature ownership lives in `modules/`.
- Shared code lives in `shared/`.
- Domain rules live in `entities/`.
- Pages are thin route wrappers.

## Folder Structure

```
client/src/
  pages/          # Next.js routes (thin wrappers only)
  modules/        # Feature modules (vertical slices)
  shared/         # Cross-feature components, hooks, utils, services
  entities/       # Domain models and pure logic
  api/            # OpenAPI generated client (read-only)
  providers/      # App-level providers
  styles/         # Global CSS (minimal)
  configs/        # Global config
```

## Module Template

```
modules/<Feature>/
  components/
  hooks/
  pages/
  services/
  data/
  utils/
  styles/          # CSS modules only
  types.ts
  index.ts
```

## Architecture Rules

### Pages

- `pages/**` should only:
  - Compose providers.
  - Render a module page component.
- No business logic in pages.

### Modules

- Feature-specific UI, hooks, and services remain in the module.
- Modules can import from `shared/`, `entities/`, or `api/`.
- Modules should not import from other modules directly.

### Shared

- `shared/` holds cross-feature utilities and UI.
- Only move to `shared/` if used in at least 2 modules.
- `shared/` must not import from `modules/`.

### Entities

- `entities/` contains domain types and pure logic.
- No React or side effects in `entities/`.

### Components

- Single file components should be placed in to a file with the same name as the component but with the `.tsx` extension.
- If the component is complex and requires multiple files (many internal only components), it should be placed in a folder with the same name as the component. The folder should contain an `index.ts` file that exports the final component.

### API Usage

- `/api/v2/*` -> OpenAPI client only (`client/src/api`).
- `/api/*` -> Axios services only.
- Wrap API access inside module services for testability.

### Styling

- CSS modules only: `*.module.css`.
- styled-jsx is deprecated and must be removed when files are touched.
- Keep `styles/` minimal for global resets and theme-level CSS.

### Naming & Tests

- Consistent folder naming within modules.
- Tests live next to the source file and have the same name as the source file but with the `.test.ts(x)` extension.

### Imports

- Use path aliases (`@client/modules`, `@client/shared`, `@client/api`).
- Avoid deep relative imports across module boundaries.

## Migration Policy

- Refactor only when a file is touched.
- Convert styled-jsx to CSS modules during touch-based changes.
- Do not initiate large-scale rewrites without approval.

## Enforcement (Planned)

- ESLint boundary rules to prevent cross-module imports.
- ESLint rule to ban styled-jsx usage (error level).
- Lint rule for page thinness.

## Example Page Wrapper

```tsx
import { SessionProvider } from 'modules/Course/contexts';
import { ScorePage } from 'modules/Score/pages/ScorePage';

export default function Page() {
  return (
    <SessionProvider>
      <ScorePage />
    </SessionProvider>
  );
}
```
