# Guidelines

- We use [TypeORM](https://typeorm.io/) for database ORM and database schema is defined in `server/src/models` directory
- `/server` is old Koa.js backend and it's deprecated and we are migrating to `/nestjs` NestJS backend. New features should be implemented in `/nestjs`. If changes need to be made to functionality located in the `/server`, it's preferable to migrate it to `/nestjs` and make changes there (an exception can be made for small critical hotfixes)

## Unit-Tests Style Guide

- Name spec file by adding `.test` to the name of tested file

Example:

```
foo.ts
foo.test.ts // test file for foo.ts
```

- Treat `describe` as a noun or situation
- Treat `it` as a statement about state or how an operation changes state

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
