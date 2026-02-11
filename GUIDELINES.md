# Guidelines

## Project Structure

- `client` - Next.js frontend (active)
- `nestjs` - NestJS backend (active)
- `server` - Old Koa.js backend. Still used for legacy endpoints and TypeORM entities

New features should be implemented in `nestjs`. If changes need to be made to functionality in `server/`, migrate it to `nestjs` first (exception: small critical hotfixes). Only allowed to modify TypeORM entities in `server`

### Path Aliases

| Alias         | Resolves To           | Used In |
| ------------- | --------------------- | ------- |
| `@entities/*` | `server/src/models/*` | nestjs  |
| `@client/*`   | `client/src/*`        | client  |

### File Naming

| Type       | Pattern              | Example                |
| ---------- | -------------------- | ---------------------- |
| Component  | PascalCase.tsx       | `CourseCard.tsx`       |
| Hook       | camelCase.ts         | `useExpelledStats.ts`  |
| Service    | kebab-case.ts        | `courses.service.ts`   |
| DTO        | kebab-case.dto.ts    | `create-course.dto.ts` |
| Test       | \*.test.ts(x)        | `auth.service.test.ts` |
| Module     | kebab-case.module.ts | `courses.module.ts`    |
| Entity     | camelCase.ts         | `course.ts`            |
| CSS Module | \*.module.css        | `Card.module.css`      |

## TypeScript Conventions

- Prefer `unknown` over `any` for truly unknown types
- Use utility types (`Pick`, `Omit`, `Partial`) instead of manual type construction
- Specify return types for public functions explicitly
- Use `readonly` modifier for data that should not be mutated
- Treat function arguments as immutable
- Use `const` by default, `let` only when reassignment is needed
- Prefix unused variables with underscore: `_unused`
- Return early to reduce nesting depth
- Use `async/await` over `.then()` chains
- Use `Promise.all()` for parallel async operations
- Order imports: external packages, internal aliases, relative imports
- Use path aliases instead of deep relative imports

## Client (React/Next.js)

### Module Structure

```
modules/<Feature>/
  components/     # Feature-specific UI
  hooks/          # Feature-specific hooks
  pages/          # Page components
  services/       # API wrappers
  types.ts        # Feature types
  index.ts        # Barrel exports
```

### Components

- Use functional components with hooks exclusively
- Export as named exports (not default)
- One component per file as primary export
- Use `React.memo()` for components with expensive renders
- Keep components pure when possible
- Define props with `type`, not `interface`

### Pages

- Keep `pages/*.tsx` as thin wrappers only
- Compose providers and render single module page component
- Delegate all logic to module components

### State Management

- Minimize `useEffect` - use only when truly necessary
- Derive computed values instead of storing in state
- Lift state up rather than prop drilling
- Use context for cross-cutting concerns

### Hooks

- Use hooks from `react-use` or `ahooks` before writing custom
- Use `useRequest` from `ahooks` for API calls
- Keep custom hooks focused and simple

### Services

- Initialize clients at module level (singleton pattern)
- Use OpenAPI client for `/api/v2/*`, axios services for legacy `/api/*`

### Ant Design

- Use `Form.useForm<T>()` with typed form values
- Use `Form.Item` with `rules` for validation
- Use `theme.useToken()` for theme colors
- Use `clsx` for conditional class composition

### Styling

- Use CSS modules exclusively: `*.module.css`
- Co-locate styles with components
- Do not use styled-jsx (deprecated)

## Backend (NestJS)

### Module Structure

```
nestjs/src/<domain>/
  <domain>.module.ts       # Module definition
  <domain>.controller.ts   # HTTP endpoints
  <domain>.service.ts      # Business logic
  dto/
    index.ts               # Barrel exports
    <entity>.dto.ts        # Response DTO
    create-<entity>.dto.ts # Input DTO with validation
    update-<entity>.dto.ts # Partial input (extends create)
```

### Controllers

- Add `@ApiTags('domain')` to controller class
- Add `@ApiOperation({ operationId: 'verbNoun' })` to every endpoint
- Add `@ApiOkResponse({ type: DtoClass })` for type safety
- Use `ParseIntPipe` for numeric params
- Transform entities to DTOs before returning
- Keep controllers thin - delegate business logic to services

### Guards and Roles

- `@UseGuards(DefaultGuard)` - authenticated users
- `@UseGuards(DefaultGuard, RoleGuard)` + `@RequiredRoles([...])` - role-based
- Use `Role.Admin`, `CourseRole.Manager` enums, not strings

### Services

- Inject repositories: `@InjectRepository(Entity)`
- Use `findOneOrFail` / `findOneByOrFail` when entity must exist
- Keep services focused on single domain

### DTOs

- Response DTO: constructor takes entity, maps to properties
- Input DTO: validation decorators (`@IsNotEmpty`, `@IsString`, etc.)
- Update DTO: `extends PartialType(CreateDto)`
- All properties need `@ApiProperty()` for OpenAPI

### Error Handling

- Include context in error messages: `Entity with id ${id} not found`

## TypeORM Entities

All entities live in `server/src/models/`. NestJS imports via `@entities/*` alias.

### Relations

- Keep both relation property and `fieldId` column

### Migrations

- Register migrations in `server/src/migrations/index.ts`
- Export all entities from `server/src/models/index.ts`

## Testing

### File Organization

- Unit tests: `{source}.test.ts(x)` next to source file
- E2E tests: `client/specs/*.spec.ts` (Playwright)
- Never use separate `__tests__` directories for new code

### Test Structure

- `describe` as noun/situation: `describe('AuthService')`
- `it` should describe behavior: `it('should return null when not found')`
- Group related tests with nested `describe` blocks
- Extract shared setup to `beforeEach`
- Extract shared mock data to reusable constants

### Test Independence

- Each test must be independent and not rely on others
- Reset mocks and state in `beforeEach`
- Ensure tests are deterministic (no random values)

### Assertions

- Assert full object shapes over field-by-field checks
- Use `expect.objectContaining()` for partial matching
- Test both success and error paths
- Test edge cases: empty arrays, null values, boundaries

### Async Testing

- Use `await expect().rejects.toThrow()` for error cases
- In React: use `findBy*` for first async query, then `getBy*` for rest
- Keep only ONE assertion inside `waitFor` callback

### NestJS Tests

- Use `Test.createTestingModule()` for setup
- Mock repositories via `getRepositoryToken(Entity)`
- Mock services with `jest.fn()` methods

### React Tests

- Use `@testing-library/react` utilities
- Query by role/text over test IDs
- Test user behavior, not implementation

### Mock Data Typing

```typescript
// Correct
const mockData = { id: 1, name: 'Test' } as User;

// Avoid
const mockData = { ... } as unknown as User;
```
