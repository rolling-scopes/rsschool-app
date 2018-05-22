import { IRouterContext } from 'koa-router';
import { Document, Model } from 'mongoose';
import { ILogger } from '../logger';
import { IApiResponse } from '../models';

export function postRoute<T extends Document>(DocumentModel: new (data: any) => T, logger: ILogger) {
    return async (ctx: IRouterContext) => {
        const model = new DocumentModel(ctx.request.body);
        const validationResult = model.validateSync();
        ctx.body = {};

        if (validationResult !== undefined) {
            ctx.status = 400;
            return;
        }
        try {
            ctx.body = await model.save();
            ctx.status = 200;
        } catch (e) {
            ctx.status = 500;
            logger.error(e, 'Failed to save document');
        }
    };
}

export function getRoute<T extends Document>(DocumentModel: Model<T>, _: ILogger) {
    return async (ctx: IRouterContext) => {
        const data = await DocumentModel.findById(ctx.params.id).exec();
        if (data === null) {
            ctx.body = {};
            ctx.status = 404;
            return;
        }
        const body: IApiResponse<T> = {
            data,
        };
        ctx.body = body;
        ctx.status = 200;
    };
}
