# Server

This workspace no longer runs as an application — the legacy Koa API has been fully migrated to the `nestjs` workspace.

It now only holds the shared TypeORM entities under `src/models/`, which NestJS consumes via the `@entities/*` path alias. Database migrations live in and are run by the `nestjs` workspace.
