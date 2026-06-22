import Router from '@koa/router';

// All /profile endpoints (GET/POST /me, GET /info) are migrated to nestjs (/api/v2/profile/*).
export function profileRoute() {
  const router = new Router<any, any>({ prefix: '/profile' });

  return router;
}
