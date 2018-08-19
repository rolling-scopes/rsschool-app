import { IRouterContext } from 'koa-router';
import { SessionType } from '../../models/event';
import { notify } from '../../notificationsSystem';

const hoursToMilliseconds = (hours: number) => hours * 60 * 60 * 1000;

export const eventNotificationPostMiddleware = async (ctx: IRouterContext, next: any) => {
    try {
        const { _id, title, sessionType, urlToDescription } = ctx.body;
        const startDateTime = new Date(ctx.body.startDateTime);

        const data = [];

        const beforeEventMessage = `${title} started at ${startDateTime.toLocaleString()}${
            urlToDescription ? `\n${urlToDescription}` : ''
        }`;
        const onEventMessage = `${title} started${urlToDescription ? `\n${urlToDescription}` : ''}`;

        switch (sessionType) {
            case SessionType.Online:
                data.push({
                    dateTime: ctx.body.startDateTime - hoursToMilliseconds(1),
                    eventId: _id,
                    message: beforeEventMessage,
                    type: 'event',
                });
                data.push({
                    dateTime: ctx.body.startDateTime,
                    eventId: _id,
                    message: onEventMessage,
                    type: 'event',
                });
                break;
            case SessionType.Offline:
                data.push({
                    dateTime: ctx.body.startDateTime - hoursToMilliseconds(2),
                    eventId: _id,
                    message: beforeEventMessage,
                    type: 'event',
                });
                break;
            case SessionType.SelfLearning:
                data.push({
                    dateTime: ctx.body.startDateTime,
                    eventId: _id,
                    message: onEventMessage,
                    type: 'event',
                });
                break;
            case SessionType.ExtraEvent:
                data.push({
                    dateTime: ctx.body.startDateTime - hoursToMilliseconds(1),
                    eventId: _id,
                    message: beforeEventMessage,
                    type: 'event',
                });
                break;
            default:
        }

        await notify(data);
        next();
    } catch (err) {
        ctx.logger.error(err);
    }
};

// export const eventPatchMiddleware = async (ctx: IRouterContext, next: any) => {
// };

// export const eventRemoveMiddleware = async (ctx: IRouterContext, next: any) => {
//     const { id } = ctx.params;
//     await remove('event', id);
//     next();
// };
