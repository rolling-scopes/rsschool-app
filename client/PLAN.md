# Client Architecture Unification Plan

## Scope

- Client-side code only (`client/src`).
- Establish a unified architecture for all new work and future refactors.
- Align structure with existing Next.js pages router.

## Decisions Locked In

- Keep `modules/` as the feature boundary.
- CSS modules only (`*.module.css`) for new/updated styling.
- API usage:
  - OpenAPI client for NestJS endpoints (`/api/v2/...`).
  - Axios for legacy endpoints (`/api/...`).
- Styled-jsx is deprecated and must be migrated when files are touched.

## Current Observations (Client)

- Pages vary between thin wrappers and heavy, stateful screens.
- Feature logic is split across `modules/`, `components/`, `services/`, `domain/`, `data/`, `utils/` without consistent ownership.
- API access is split between generated OpenAPI client and ad-hoc axios services without clear rules.
- Styling is inconsistent (styled-jsx, inline styles, global CSS, AntD tokens).
- Naming and folder casing are inconsistent across modules.

## Target Architecture

### High-level structure

```
client/src/
  pages/          # Routes only (thin wrappers)
  modules/        # Feature modules (vertical slices)
  shared/         # Cross-feature building blocks
  entities/       # Domain models and pure logic
  api/            # Generated OpenAPI client (read-only)
  providers/      # App-level providers
  styles/         # Global styles (minimal)
  configs/        # Global config
```

### Module layout template

```
modules/<Feature>/
  components/
  hooks/
  pages/
  services/
  data/
  utils/
  styles/          # CSS modules
  types.ts
  index.ts
```

## Architecture Rules (New Code)

1. Pages are thin: `pages/**` only compose providers and render module pages.
2. Module ownership: feature-specific code stays inside its module.
3. Shared rules: only move to `shared/` when used by 2+ modules.
4. API rules:
   - `/api/v2/*` -> OpenAPI client only.
   - `/api/*` -> axios services only.
   - Wrap API calls in module services.
5. Styling:
   - Use `*.module.css` only.
   - No new styled-jsx; migrate when touched.
6. Domain logic in `entities/` must be pure (no React, no side effects).
7. Imports should use path aliases; avoid deep relative paths.
