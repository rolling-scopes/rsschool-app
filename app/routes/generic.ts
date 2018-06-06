import { IRouterContext } from 'koa-router';
import { Document, Model, STATES, Types, connection } from 'mongoose';
import { ILogger } from '../logger';
import { IApiResponse } from '../models';
import { NOT_FOUND, OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } from 'http-status-codes';

export function postRoute<T extends Document>(DocumentModel: new (data: any) => T, logger: ILogger) {
    return async (ctx: IRouterContext) => {
        const model = new DocumentModel(ctx.request.body);
        const validationResult = model.validateSync();
        ctx.body = {};

        if (validationResult !== undefined) {
            ctx.status = BAD_REQUEST;
            return;
        }
        try {
            ctx.body = await model.save();
            ctx.status = OK;
        } catch (e) {
            ctx.status = INTERNAL_SERVER_ERROR;
            logger.error(e, 'Failed to save document');
        }
    };
}

export function getRoute<T extends Document>(
    DocumentModel: Model<T>,
    options: { useObjectId: boolean } = { useObjectId: true },
    logger: ILogger,
) {
    return async (ctx: IRouterContext) => {
        try {
            if (connection.readyState !== STATES.connected) {
                ctx.status = INTERNAL_SERVER_ERROR;
                return;
            }
            const data = await DocumentModel.findById(
                options.useObjectId ? Types.ObjectId(ctx.params.id) : ctx.params.id,
            ).exec();
            if (data === null) {
                ctx.body = {};
                ctx.status = NOT_FOUND;
                return;
            }
            const body: IApiResponse<T> = {
                data,
            };
            ctx.body = body;
            ctx.status = OK;
        } catch (err) {
            logger.error(err);
            ctx.status = INTERNAL_SERVER_ERROR;
        }
    };
}
