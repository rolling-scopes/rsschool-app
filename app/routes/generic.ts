import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'http-status-codes';
import { IRouterContext } from 'koa-router';
import { connection, Document, Model, STATES, Types } from 'mongoose';
import { IApiResponse } from '../models';
import { setResponse } from './utils';

export function createPostRoute<T extends Document>(DocumentModel: new (data: any) => T) {
    return async (ctx: IRouterContext, next: any) => {
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
            next();
        } catch (e) {
            ctx.status = INTERNAL_SERVER_ERROR;
            ctx.logger.error(e, 'Failed to save document');
        }
    };
}

export function createGetRoute<T extends Document>(
    DocumentModel: Model<T>,
    options: { useObjectId: boolean } = { useObjectId: true },
) {
    return async (ctx: IRouterContext, next: any) => {
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
            next();
        } catch (err) {
            ctx.logger.error(err);
            ctx.status = INTERNAL_SERVER_ERROR;
        }
    };
}

export function createPatchRoute<T extends Document>(DocumentModel: Model<T>) {
    return async (ctx: IRouterContext, next: any) => {
        const { _id, ...body } = ctx.request.body;

        try {
            const result = await DocumentModel.findByIdAndUpdate(_id, body, { new: true });

            if (result === null) {
                setResponse(ctx, NOT_FOUND);
                return;
            }

            setResponse(ctx, OK, result);
            next();
        } catch (e) {
            ctx.status = INTERNAL_SERVER_ERROR;
            ctx.logger.error(e, 'Failed to update document');
        }
    };
}

export function createDeleteRoute<T extends Document>(DocumentModel: Model<T>) {
    return async (ctx: IRouterContext, next: any) => {
        const { id } = ctx.params;

        try {
            const query = await DocumentModel.findByIdAndRemove(id);

            if (query === null) {
                setResponse(ctx, NOT_FOUND);
                return;
            }

            setResponse(ctx, OK);
            next();
        } catch (e) {
            ctx.status = INTERNAL_SERVER_ERROR;
            ctx.logger.error(e, 'Failed to remove document');
        }
    };
}
