# NestJS

This workspace contains the active NestJS backend for RS School App.

## Scope

- REST API for the app
- OpenAPI spec used to generate the client SDK

## Setup

- Follow root `README.md` for database setup and running the full app
- Copy `nestjs/.env.example` to `nestjs/.env`

## OpenAPI client

- Run `npm run openapi` to regenerate `client/src/api` and `nestjs/src/spec.json`
- Commit the generated changes

## Notes

- The deprecated Koa backend lives in `server/`
