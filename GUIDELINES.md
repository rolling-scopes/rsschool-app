# Guidelines

- We use [TypeORM](https://typeorm.io/) for database ORM and database schema is defined in `server/src/models` directory
- `/server` is old Koa.js backend and it's deprecated and we are migrating to `/nestjs` NestJS backend

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
