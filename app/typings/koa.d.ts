import * as koa from 'koa-router';
import { IUserSession } from '../models';

declare module 'koa-router' {
    export interface IRouterContext {
        state: { user: IUserSession | undefined };
    }
}
