import * as Router from 'koa-router';
import * as mongoose from 'mongoose';
import { ILogger } from '../../logger';

function getMongoConnectionState(logger: ILogger) {
    logger.info(`Mongo connection state is ${mongoose.connection.readyState}`);
    return mongoose.connection.readyState === 1 ? 'Ok' : 'Fail';
}

/**
 * Basic healthcheck
 */
export function healthRouter() {
    const router = new Router();
    router.get('/health', async ctx => (ctx.body = getMongoConnectionState(ctx.logger)));
    return router;
}
