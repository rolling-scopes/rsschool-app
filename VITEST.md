# Vitest Migration Plan

## Goal

Migrate all automated tests in this repository from Jest to latest Vitest with no feature regressions, stable CI reports, and same or better local developer experience

## Current Baseline

- Monorepo with three active workspaces: `client`, `server`, `nestjs`
- Jest is used in all three workspaces through local scripts and dedicated config files
- Current usage footprint is large (`421` Jest-related references in source and test files, across `97` files)
- Current CI uploads `jest-junit-*.xml` artifacts and relies on per-workspace `test:ci`
- Root ESLint setup loads `eslint-plugin-jest` test recommendations

## Migration Strategy

- Use phased migration with strict checkpoints
- Keep repository green after each phase
- Prefer adapter-compatible migration first (test runtime switch), then API cleanup
- Migrate workspace by workspace, not all at once
- Keep rollback path simple by limiting each pull request scope

## Work Breakdown

### Phase 0 - Planning and guardrails

1. Create tracking issue and checklist for all steps in this document
2. Freeze non-critical test refactors during migration window
3. Define acceptance criteria
   - all current test scripts have Vitest equivalents
   - CI test jobs pass in all workspaces
   - XML reports still published and consumed by report workflow
   - no Jest runtime package remains in active dependencies
4. Define branch strategy
   - one umbrella branch for the migration
   - optional child branches by workspace if team parallelizes
5. Define rollback strategy
   - each phase merged only after green CI
   - keep isolated commits for dependency changes, config changes, and test API updates

### Phase 1 - Repository inventory and mapping

1. Build complete inventory of Jest touchpoints
   - dependency graph (`jest`, `ts-jest`, `@types/jest`, `jest-environment-jsdom`, `jest-junit`, `jest-mock-axios`)
   - config files (`client/jest.config.mjs`, `server/jest.config.mjs`, `nestjs/jest.config.mjs`, `nestjs/test/jest-e2e.json`)
   - scripts in `package.json` files
   - ESLint test plugin configuration
   - CI workflow references to Jest output names
2. Build test API usage inventory
   - global APIs (`jest.fn`, `jest.spyOn`, `jest.mock`, fake timers, reset helpers)
   - type usages (`jest.Mock`, `jest.mocked`)
   - setup files and global matchers
3. Build workspace-specific complexity score
   - `client`: Next.js + jsdom + module mocks + `jest-mock-axios`
   - `server`: Node + TypeScript transform + legacy backend
   - `nestjs`: Node + Nest testing utilities + e2e config
4. Lock expected command matrix for final validation
   - root: `npm run lint`, `npm run test`, `npm run compile`, `npm run format`
   - plus workspace-level targeted test runs during migration

### Phase 2 - Target architecture decisions

1. Choose Vitest version and lockfile policy
2. Decide transform strategy for TypeScript in each workspace
   - native Vitest + Vite transform where possible
   - avoid keeping Jest-specific transform chain
3. Decide coverage provider and reporter format parity
4. Decide XML reporter replacement strategy for `jest-junit`
   - select Vitest-compatible junit reporter
   - preserve artifact naming or update workflows accordingly
5. Decide lint strategy
   - replace `eslint-plugin-jest` with Vitest-aware ruleset, or mixed mode during transition
6. Decide test file naming policy
   - keep current `.test`/`.spec` names for minimal churn
7. Decide future approach for Nest e2e tests
   - keep in Vitest as integration tests
   - or keep separate runner temporarily with clear deprecation date

### Phase 3 - Foundation changes at root level

1. Update root dependencies
   - add Vitest core and shared helpers
   - remove root Jest packages when no longer needed
2. Add shared base Vitest config pattern
   - either reusable root config module or per-workspace local configs extending shared defaults
3. Update root lint config for test files
   - switch from Jest plugin defaults to Vitest-aware defaults
4. Update root scripts only if needed for monorepo ergonomics
   - keep `turbo run test` behavior unchanged for contributors
5. Regenerate lockfile and confirm deterministic install

### Phase 4 - Migrate client workspace

1. Replace Jest config with Vitest config compatible with Next.js client tests
2. Recreate jsdom environment setup and test globals
3. Migrate `setupJest` file naming and imports to Vitest-compatible setup
4. Replace Jest scripts in `client/package.json`
   - `test`, `test:ci`, `test:watch`, `coverage`
5. Replace or adapt `jest-mock-axios` usage
   - evaluate native module mocking and spies first
   - if replacement package is needed, add it explicitly
6. Update test files in batches
   - convert `jest.*` runtime calls to `vi.*`
   - convert typed mocks from Jest types to Vitest types
   - fix hoisting-sensitive mocks (`jest.mock` patterns)
7. Run client tests repeatedly until green
8. Ensure junit XML output generated for CI artifact upload

### Phase 5 - Migrate server workspace

1. Replace `server/jest.config.mjs` with Vitest config for Node environment
2. Replace Jest scripts in `server/package.json`
3. Convert server test runtime APIs from `jest.*` to `vi.*`
4. Validate module resolution parity (`moduleDirectories`, aliases, TS paths)
5. Validate timers and mocks behavior in legacy service tests
6. Run server test suite and coverage commands
7. Ensure CI XML report is emitted at expected path

### Phase 6 - Migrate nestjs workspace

1. Replace `nestjs/jest.config.mjs` with Vitest config
2. Replace `nestjs/test/jest-e2e.json` strategy
   - either merge into Vitest project config
   - or split unit/integration projects in a single Vitest config
3. Replace Jest scripts in `nestjs/package.json`
4. Convert Nest unit tests from `jest.*` to `vi.*`
5. Validate compatibility with Nest testing module patterns
6. Rework debug script strategy (`test:debug`) for Vitest runtime
7. Migrate e2e command to Vitest-equivalent workflow
8. Ensure junit XML report is emitted at expected path

### Phase 7 - CI and reporting migration

1. Update `.github/workflows/pull_request.yml`
   - keep per-workspace test jobs
   - update artifact paths and names if reporter file names changed
2. Update `.github/workflows/test_report.yml`
   - replace any Jest-specific reporter assumptions
   - ensure parsed reports still annotate PRs
3. Update deploy workflow test command assumptions where relevant
4. Validate that all workflows still run under current Node version policy

### Phase 8 - TypeScript and tooling cleanup

1. Remove Jest-only types from tsconfig include/types if present
2. Ensure Vitest globals typing configured per workspace or explicit imports used
3. Remove obsolete Jest dependencies and config files
4. Remove stale test setup filenames referencing Jest
5. Remove dead helper code or mocks created only for Jest behavior

### Phase 9 - Verification and hardening

1. Full local validation
   - `npm run lint`
   - `npm run test`
   - `npm run compile`
   - `npm run format`
2. Spot-check changed tests for deterministic behavior
   - fake timers
   - async expectations
   - module mocks
3. Run CI on migration branch and verify all jobs green
4. Compare test duration before/after and capture regression notes
5. Compare coverage before/after and capture gaps

### Phase 10 - Documentation and handoff

1. Update contributor docs
   - root `README.md` testing section if needed
   - `CONTRIBUTING.md` test commands and local workflow
   - workspace READMEs if they mention Jest
2. Add migration notes
   - known incompatibilities
   - new mocking patterns
   - timer usage guidance
3. Create follow-up backlog for non-blocking improvements
   - optimize slow tests
   - improve test isolation
   - enforce new lint rules for Vitest patterns

## Execution Model for LLM Worker

### Operating rules

1. Work in small PRs with one phase or one workspace per PR
2. Keep PRs reviewable (target under ~400 changed lines unless mechanical rename)
3. Do not mix runtime migration with unrelated refactors
4. After each PR, run full required checks and attach outputs
5. If migration blocks on one workspace, ship completed workspace migrations first behind stable CI

### Suggested PR sequence

1. PR 1: root dependencies, lint plugin transition, shared Vitest base
2. PR 2: client migration
3. PR 3: server migration
4. PR 4: nestjs migration including e2e strategy
5. PR 5: CI/reporting cleanup and docs
6. PR 6: final Jest removal and dead-code cleanup

### Definition of done

- No active workspace uses Jest runtime commands
- No active workspace depends on Jest-only packages
- All local required commands pass at root
- CI test and reporting workflows pass with Vitest outputs
- Documentation reflects Vitest-based workflow

## Risk Register and Mitigations

1. Mock hoisting differences break tests
   - mitigate with batch conversion and per-file verification
2. Timer behavior differences create flaky tests
   - mitigate by standardizing fake timer lifecycle in setup/teardown
3. Next.js client transform differences cause import failures
   - mitigate by validating module transform and alias mapping early in client phase
4. Nest e2e behavior differs from Jest config assumptions
   - mitigate by isolating e2e migration and validating with dedicated command before merge
5. CI report parser mismatch after reporter switch
   - mitigate by updating report workflow and testing artifact parsing in draft PR
6. Hidden Jest references survive in tooling
   - mitigate with final repository-wide scan for `jest` tokens and config filenames

## Final Migration Checklist

- [ ] Root dependencies switched to Vitest stack
- [ ] ESLint test rules updated for Vitest
- [ ] Client tests green on Vitest
- [ ] Server tests green on Vitest
- [ ] NestJS tests green on Vitest
- [ ] NestJS e2e path migrated or formally isolated with deadline
- [ ] CI test jobs green
- [ ] CI test reports parsed and published
- [ ] Jest configs removed
- [ ] Jest packages removed from lockfile and package manifests
- [ ] Root validation commands pass
- [ ] Documentation updated