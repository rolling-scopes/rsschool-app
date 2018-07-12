import { NOT_FOUND, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { StageModel } from '../../models/stage';
import { setResponse } from '../utils';

export const patchStageRoute = async (ctx: Router.IRouterContext) => {
    const { _id, ...body } = ctx.request.body;
    const stage = await StageModel.findByIdAndUpdate(_id, body, { new: true });

    if (stage === null) {
        setResponse(ctx, NOT_FOUND);
        return;
    }

    setResponse(ctx, OK, stage);
};
