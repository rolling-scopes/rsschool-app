# Client Refactoring TODO

This document tracks refactoring tasks to achieve the unified client architecture defined in [README.md](./README.md).

## Summary

The refactoring aims to:

- Move feature ownership into `modules/`
- Consolidate cross-feature code into `shared/`
- Make pages thin wrappers (no business logic)
- Eliminate cross-module imports

**Current State:**

- 27 pages with significant business logic need refactoring
- 12 cross-module import violations between modules
- 60+ files importing from modules outside of proper boundaries

---

## Tasks

### Setup & Structure

- [ ] **Create `shared/` folder structure**

  - Add `shared/components/`
  - Add `shared/hooks/`
  - Add `shared/services/`
  - Add `shared/utils/`

- [ ] **Move reusable components to `shared/components/`**

  - Move `components/Table/` (used by 10+ modules)
  - Move `components/Icons/` (used globally)
  - Move `components/LoadingScreen.tsx`
  - Move `components/Timer.tsx`
  - Move `components/Forms/` (used by 10+ pages)
  - Move `components/PageLayout/` (used by all admin pages)

- [ ] **Move reusable hooks to `shared/hooks/`**

  - Move `hooks/useTheme.tsx`
  - Move `utils/useWindowDimensions.ts`

- [ ] **Move reusable utilities to `shared/utils/`**
  - Move `utils/text-utils.ts`
  - Move `utils/queryParams-utils.ts`
  - Move `utils/onlyDefined.ts`
  - Move `utils/pagination.ts`

### Thin Page Wrappers (Extract Business Logic)

- [ ] **Refactor `pages/admin/discord-telegram.tsx`**

  - Create `DiscordAdmin` module
  - Extract CRUD operations to module service
  - Extract modal and table components
  - Move page to wrapper pattern

- [ ] **Refactor `pages/admin/events.tsx`**

  - Create `EventsAdmin` module
  - Extract events management logic
  - Move page to wrapper pattern

- [ ] **Refactor `pages/admin/user-group.tsx`**

  - Create `UserGroups` module
  - Extract user group management
  - Move page to wrapper pattern

- [ ] **Refactor `pages/admin/users.tsx`**

  - Create `Users` module
  - Extract user search and management
  - Move page to wrapper pattern

- [ ] **Refactor `pages/applicants/index.tsx`**

  - Create `Applicants` module or integrate with existing module
  - Extract opportunities logic
  - Move page to wrapper pattern

- [ ] **Refactor `pages/registry/epamlearningjs.tsx`**

  - Move business logic to `Registry` module
  - Extract form handling
  - Move page to wrapper pattern

- [ ] **Refactor `pages/gratitude.tsx`**

  - Create `Gratitude` module
  - Extract badge and gratitude submission logic
  - Move page to wrapper pattern

- [ ] **Refactor `pages/profile/index.tsx`** (high priority - 226 lines)

  - Create `Profile` module with full page logic
  - Extract profile fetching, update, Discord auth
  - Move page to wrapper pattern

- [ ] **Refactor `pages/admin/mentor-registry.tsx`** (high priority - 342 lines)

  - Move to existing `MentorRegistry` module
  - Extract 12+ useState hooks and complex filtering logic

- [ ] **Refactor `pages/course/admin/students.tsx`** (high priority - 326 lines)

  - Move to `CourseManagement` or create `StudentsAdmin` module
  - Extract certificate, expel, restore operations

- [ ] **Refactor `pages/course/admin/users.tsx`** (high priority - 297 lines)

  - Move to `CourseManagement` module
  - Extract user and group management logic

- [ ] **Refactor `pages/course/admin/mentors.tsx`** (286 lines)

  - Move to `CourseManagement` module
  - Extract mentor operations and statistics

- [ ] **Refactor `pages/course/admin/tasks.tsx`** (269 lines)

  - Move to `CourseManagement` module
  - Extract task distribution logic

- [ ] **Refactor `pages/course/student/interviews.tsx`**

  - Move to `Interview` module
  - Extract interview registration logic

- [ ] **Refactor `pages/course/mentor/interview-technical-screening.tsx`** (high priority - 429 lines)

  - Move to `Mentor` or `Interviews` module
  - Extract complex form and score calculation logic

- [ ] **Refactor `pages/course/student/cross-check-review.tsx`** (323 lines)

  - Move to `CrossCheck` module
  - Extract criteria and submission logic

- [ ] **Refactor `pages/course/submit-scores.tsx`** (262 lines)
  - Move to `Score` module
  - Extract CSV parsing and score submission

### Fix Cross-Module Imports

- [ ] **Fix `modules/Tasks` → `CrossCheck` import**

  - `modules/Tasks/components/CrossCheckTaskCriteriaPanel/` imports from `CrossCheck`
  - Extract shared components to `shared/` or create proper module boundaries

- [ ] **Fix `modules/Course` → `CrossCheck` import**

  - `modules/Course/pages/Student/CrossCheckSubmit/index.tsx` imports from `CrossCheck`
  - Move `CrossCheckSubmit` page components to `CrossCheck` module

- [ ] **Fix `modules/CourseManagement` → `Schedule` import**

  - `modules/CourseManagement/components/CourseEventModal/` imports from `Schedule`
  - Extract `constants` to `shared/` or create dedicated constants module

- [ ] **Fix `modules/Schedule` → `CourseManagement` import**

  - `modules/Schedule/pages/SchedulePage/` imports from `CourseManagement`
  - Extract shared modals to `shared/components/modals/`:
    - `CourseEventModal`
    - `CourseTaskModal`
    - `CoursesListModal`

- [ ] **Fix `modules/MentorRegistry` → `Schedule` import**

  - `modules/MentorRegistry/components/MentorRegistryTable.tsx` imports `FilteredTags` from `Schedule`
  - Move `FilteredTags` to `shared/components/`

- [ ] **Fix `modules/StudentDashboard` → `Schedule` import**

  - `modules/StudentDashboard/components/NextEventCard/renderers.tsx` imports from `Schedule`
  - Move renderers to `shared/utils/`

- [ ] **Fix `modules/StudentDashboard` → `Schedule` import**

  - `modules/StudentDashboard/components/TasksChart.tsx` imports from `Schedule`
  - Extract shared chart logic

- [ ] **Fix `modules/CrossCheckPairs` → `CrossCheck` import**

  - `modules/CrossCheckPairs/pages/CrossCheckPairs/` imports from `CrossCheck`
  - Extract shared `SolutionReview` components to proper location

- [ ] **Fix `modules/CrossCheckPairs` → `Feedback` import**

  - Resolve Feedback module dependency
  - Create proper module boundaries

- [ ] **Fix `modules/Mentor` → `Feedback` import**

  - `modules/Mentor/pages/StudentFeedback/` imports from `Feedback`
  - Move `FeedbackForm` to `Mentor` module or create `Feedback` module

- [ ] **Fix `modules/CrossCheck` → `Feedback` import** (if exists)
  - Verify and resolve any Feedback dependencies

### Future Tasks

- [ ] Create `ESLint` boundary rules to prevent cross-module imports
- [ ] Create `ESLint` rule to enforce thin pages
- [ ] Set up module-specific barrel exports (`index.ts` files)
- [ ] Add path alias configuration for `@client/shared/*`
- [ ] Create `shared/` module for truly shared components
- [ ] Audit `components/` for items used by only 1 module (move to that module)

---

## Notes

### Module Dependencies Analysis

**Most Common Cross-Module Imports:**

1. `modules/Course/contexts` - Used by 60+ files (session and active course context)
2. `modules/CrossCheck` - Used by Tasks and Course modules
3. `modules/Schedule` - Used by MentorRegistry and StudentDashboard
4. `modules/CourseManagement` - Used by Schedule

### Styled-JSX Status

No styled-jsx usage found in the codebase. The project already uses CSS modules (`.module.css` files).

### Architecture Violations by Severity

**Critical (blocks architecture):**

- 27 pages with embedded business logic
- 12 modules importing from other modules

**High (should fix soon):**

- 60+ components/services in wrong directories
- Missing `shared/` folder structure

**Medium (cleanup):**

- Some services in `services/` that should be in modules
- Components in `components/` used by only 1 module
