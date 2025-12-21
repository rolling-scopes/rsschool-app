# Domain Model

This document describes the core domain model implemented in `server/src/models` and how the entities relate. It is meant as a quick map for agents working on the platform.

## Core identity and profile

- `User` is the primary identity (GitHub-based) with contact info, profile details, and visibility settings.
- `ProfilePermissions` stores per-user visibility rules for profile fields (public vs student vs mentor).
- `ExternalAccount` records auxiliary learning platforms (codewars, etc) on `User`.
- `LoginState` stores short-lived state for auth or channel linking flows.
- `Session` defines derived course roles used by authorization (`CourseRole`).

## Courses, roles, and enrollment

- `Course` defines a cohort with dates, discipline, location, flags (planned/completed/invite-only), mentoring settings, and certificate rules.
- `Discipline` is a taxonomy item used by courses, tasks, and events.
- `DiscordServer` holds course communication endpoints (gratitude URL, mentors chat, etc).
- `Student` is a per-course role for a `User` with progress flags (failed/expelled/completed), scores, rank, mentoring, and certificate.
- `Mentor` is a per-course role for a `User` with mentor settings and assigned students.
- `CourseUser` stores course-scoped role flags (manager, supervisor, activist, task owner, etc).
- `CourseManager` is a simple join for course managers (legacy or specific flows).
- `Registry` is a course registration request for a user (student or mentor) with status.
- `MentorRegistry` stores mentor preferences and capacity for course assignment.
- `UserGroup` is a static group of users tied to course roles.

## Tasks and assessment

- `Task` is the reusable definition of a task (type, description, skills, tags, criteria).
- `CourseTask` is a `Task` scheduled for a specific course with deadlines, scoring, checker type, and cross-check status.
- `TaskCriteria` stores per-task cross-check criteria definitions.
- `TaskResult` is the authoritative score and submission links for a student on a course task.
- `TaskChecker` links a mentor to a student for a course task review.
- `TaskArtefact` stores optional artefacts (video, presentation, notes) per student and course task.
- `TaskVerification` stores auto-check results for tests (status, score, answers, metadata).
- `TaskInterviewStudent` enrolls a student into a task-based interview flow.
- `TaskInterviewResult` stores mentor interview results and form answers for a task.

## Cross-check (peer review)

Used when `CourseTask.checker = crossCheck`.

- `TaskSolution` is a student's submitted solution URL plus review metadata.
- `TaskSolutionChecker` assigns a reviewer (student) to a submitted solution.
- `TaskSolutionResult` stores a review score, criteria-based review, and discussion messages.
- `CourseTask.crossCheckStatus` tracks lifecycle: `initial` -> `distributed` -> `completed`.

## Interviews and stage assessments

- `StageInterview` records a mentor-student interview tied to a course and optional task/stage.
- `StageInterviewStudent` registers a student into stage interview flow.
- `StageInterviewFeedback` stores structured JSON feedback for a stage interview.

## Teams and distributions

- `TeamDistribution` defines a team formation window and constraints (size, score thresholds).
- `TeamDistributionStudent` tracks who participates in distribution and whether they are assigned.
- `Team` is a concrete team with members, lead, and chat metadata.

## Schedule and events

- `Event` is a reusable schedule entity (lecture, workshop, etc) with description and type.
- `CourseEvent` schedules an `Event` in a course with date/time, organizer, and details.

## Feedback, reputation, and certificates

- `Feedback` is a public gratitude/badge from one user to another (optionally course-scoped).
- `PrivateFeedback` is internal feedback not visible publicly.
- `StudentFeedback` is mentor feedback with structured soft-skill ratings and recommendations.
- `Certificate` is an issued course certificate linked to a student.
- `Contributor` represents platform contributors with profile descriptions.

## CV and hiring

- `Resume` stores CV data for a user and visibility to employers.

## Notifications

- `Notification` defines notification types and parent/child relationships.
- `NotificationChannel` defines delivery channels (`email`, `telegram`, `discord`).
- `NotificationChannelSettings` provides per-notification templates per channel.
- `NotificationUserSettings` stores per-user subscription preferences per notification+channel.
- `NotificationUserConnection` stores channel identifiers linked to users (e.g. Telegram id).
- `Alert` is a global or course-scoped banner message.

## Audit and integrations

- `History` stores audit records for inserts/updates/removals with before/after snapshots.
- `RepositoryEvent` stores webhook-like activity from GitHub repositories.
- `Prompt` stores configurable text prompts for AI-assisted features.

## Relationship map (high level)

- `User` -> `Student` / `Mentor` (per course)
- `Course` -> `Student`, `Mentor`, `CourseTask`, `CourseEvent`, `Registry`
- `Task` -> `CourseTask` -> `TaskResult` / `TaskSolution` / `TaskVerification`
- `TaskSolution` -> `TaskSolutionChecker` -> `TaskSolutionResult` (cross-check)
- `CourseTask` -> `TaskInterviewStudent` / `TaskInterviewResult`
- `Course` -> `TeamDistribution` -> `Team` / `TeamDistributionStudent`
- `Course` -> `Certificate` (via `Student`)
- `User` -> `Resume` / `ProfilePermissions` / `NotificationUserSettings`