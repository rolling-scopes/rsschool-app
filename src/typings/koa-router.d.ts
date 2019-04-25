import * as koa from 'koa-router';
import { IUserSession } from '../models';
import { ILogger } from '../logger';

declare module 'koa-router' {
  export interface IRouterContext {
    state: { user: IUserSession | undefined };
    logger: ILogger;
  }
}

declare module 'koa' {
  export interface Context {
    logger: ILogger;
  }
}
