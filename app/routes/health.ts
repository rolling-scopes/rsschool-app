import * as Router from 'koa-router';
import * as mongoose from 'mongoose';
import { ILogger } from '../logger';

function getMongoConnectionState(logger?: ILogger) {
    logger!.info(`Mongo connection state is ${mongoose.connection.readyState}`);
    return mongoose.connection.readyState === 1 ? 'Ok' : 'Fail';
}

export const healthRoute = (logger: ILogger) => {
    const healthRouter = new Router();
    /**
     * Basic healthcheck
     */
    healthRouter.get('/health', async ctx => (ctx.body = getMongoConnectionState(logger)));
    return healthRouter.routes();
};
