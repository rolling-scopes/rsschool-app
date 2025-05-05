# How To Contribute

## Local development

### Prerequisites

- [Git 2.10+](https://git-scm.com/downloads)
- [NodeJS LTS](https://nodejs.org/en/)
- [Podman](https://podman.io/docs/installation)
- [podman-compose](https://github.com/containers/podman-compose)

### Steps

1. Fork the repository (<https://help.github.com/articles/fork-a-repo/>)

2. Clone the repository to your local machine (<https://help.github.com/articles/cloning-a-repository/>)

   ```command-line
   git clone git@github.com:[username]/rsschool-app.git
   ```

3. Navigate into the directory where you've cloned the source code and install NPM dependencies

   ```command-line
   cd rsschool-app
   npm install
   ```

4. Create a branch for your feature

   ```command-line
   git checkout -b feature-x master
   ```

5. The application requires a connection to a Postgres database. Here is how to get test database running locally:

   Run a Postgres Database locally using Podman & podman-compose

   ```command-line
   npm run db:up
   ```

   Restore a test database snapshot

   ```command-line
   npm run db:restore
   ```

   If you are done with development, stop the database;

   ```command-line
   npm run db:down
   ```

6. Run the application in development mode with live reload:

   ```command-line
   npm start
   ```

7. Do hacking 👩‍💻👨‍💻

8. You could specify any environment variable during development using `.env` file. Make a copy of `server/.env.example` and `nestjs/.env.example` and rename it to `server/.env` or `nestjs/.env` respectively. We support it via `dotenv` package. More information about usage here: <https://github.com/motdotla/dotenv>

9. By default locally, you will be logged with `admin` access. If you want to change it, need to set `RSSCHOOL_AUTH_DEV_ADMIN` to `false` in `nestjs/.env` file

   **IMPORTANT:** Never commit changes to `.env` file

10. Do not forget to write unit-tests for your feature following [Unit-Tests Style Guide](#unit-tests-style-guide). We use [Jest](https://facebook.github.io/jest/) for unit-tests.

11. Write end-to-end tests for your feature if applicable. Please see `client/specs` directory for more information. We use [Playwright](https://playwright.dev/) for end-to-end tests. You can run them using `npm run test:e2e` command and they supposed to work against test database snapshot.

12. Make sure tests, lints pass and code formatted properly (they'll be run on a git pre-commit hook too)

    ```command-line
    npm test
    npm run lint
    npm run pretty
    ```

13. Commit your changes using a descriptive commit message that follows our [Commit Message Conventions](#git-commit-messages)

    ```command-line
    git commit -m "feat: implement feature X"
    ```

14. Push your branch to GitHub:

    ```command-line
    git push origin feature-x
    ```

15. Create a pull request. We support "feature branch" deployments. If you want to deploy your pull request, please add `deploy` label during creation.

## API client generation

We use [OpenAPI Generator](https://openapi-generator.tech/) to generate API client for `NestJS` API. Here are steps how to do it:

- Make sure database is running locally
- Navigate to `./nestjs`
- Run

  ```sh
  npm run openapi
  ```

- Commit updated files (`/client/src/api/*` and `./nestjs/src/spec.json`)

_NOTE: in case of problems with running `openapi` you might need to install [Java](https://www.java.com/) or use some other way from [OpenAPI Generator Installation docs](https://openapi-generator.tech/docs/installation/)_

## Database Migrations

If you made changes to DB models, you need to create a DB migration. Here are steps how to do it

1. Go to `/server`
2. Run `npm run typeorm:migration:generate src/migrations/{MigrationName}` where `{MigrationName}` is your migration name.
3. Import your migration to `migrations` array at `./server/src/migrations/index.ts`
4. Commit and push your changes

See more about TypeORM migrations at official docs [Migrations](https://github.com/typeorm/typeorm/blob/master/docs/migrations.md)

## Pull Requests

- Check how to create a [Pull Request](https://help.github.com/articles/creating-a-pull-request/) (PR).
- PR titles must follow [Conventional Commits](#git-commit-messages).
- Do not include issue IDs in the PR title.
- Use GitHub's [Draft PR](https://github.blog/2019-02-14-introducing-draft-pull-requests/) feature instead of using "WIP" (Work In Progress) in the title.
- Consider adding relevant `area:*` label(s) to your PR.
- Add the `deploy` label if you want the PR deployed to the staging environment. **NOTE**: This feature does not work for PRs opened from forks due to security limitations.
- Write a clear and meaningful description for your PR.
- Include screenshots and animated GIFs in your PR description whenever possible to demonstrate changes.

## Style Guides

### Git Commit Messages

- Use [Conventional Commits](https://conventionalcommits.org/) format
- Allowed Types:
  - build: - _changes that affect the build system or external dependencies (example scopes: npm, webpack)_
  - ci: - _changes to our CI configuration files and scripts (example scopes: drone)_
  - docs: - _documentation only changes_
  - feat: - _a new feature_
  - fix: - _a bug fix_
  - perf: - _a code change that improves performance_
  - refactor: - _a code change that neither fixes a bug nor adds a feature_
  - style: - _changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)_
  - test: - _adding missing tests or correcting existing tests_
- Use the present tense ("add feature" not "added feature")
- Use the imperative mood ("move cursor to..." not "moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### TypeScript Style Guide

We use Prettier for TypeScript formatting. Please run the following command before your commit:

```command-line
npm run format
```

For your convenience, you can integrate Prettier into your favorite IDE (<https://prettier.io/docs/en/editors.html>)

### Unit-Tests Style Guide

- Name spec file by adding `.test` to the name of tested file.

Example:

```string
foo.ts
foo.test.ts // test file for foo.ts
```

- Treat `describe` as a noun or situation.
- Treat `it` as a statement about state or how an operation changes state.

Example:

```javascript
describe('Header', () => {
  it('shows username', () => {
    //...
  });

  it('shows logout button', () => {
    //...
  });
});
```
