import Router from '@koa/router';

export function registryRouter() {
  const router = new Router<any, any>({ prefix: '/registry' });
  return router;
}
