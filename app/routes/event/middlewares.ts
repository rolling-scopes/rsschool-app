import { IRouterContext } from 'koa-router';
import { SessionType } from '../../models/event';
import { notify, update, remove } from '../../notificationsSystem';

const hoursToMilliseconds = (hours: number): number => hours * 60 * 60 * 1000;

const getPrettyTime = (dateTime: Date): string => {
    return `${dateTime.getHours()}:${dateTime.getMinutes()}`;
};

const getNotifications = (data: any) => {
    const { title, sessionType, urlToDescription, startDateTime } = data;

    const notifications = [];

    const beforeEventMessage = `${title} started at ${getPrettyTime(new Date(startDateTime))}${
        urlToDescription ? `\n${urlToDescription}` : ''
    }`;
    const onEventMessage = `${title} started${urlToDescription ? `\n${urlToDescription}` : ''}`;

    switch (sessionType) {
        case SessionType.Online:
            notifications.push(
                { dateTime: startDateTime - hoursToMilliseconds(1), message: beforeEventMessage },
                { dateTime: startDateTime, message: onEventMessage },
            );
            break;
        case SessionType.Offline:
            notifications.push({ dateTime: startDateTime - hoursToMilliseconds(2), message: beforeEventMessage });
            break;
        case SessionType.SelfLearning:
            data.push({ dateTime: startDateTime, message: onEventMessage });
            break;
        case SessionType.ExtraEvent:
            notifications.push({ dateTime: startDateTime - hoursToMilliseconds(1), message: beforeEventMessage });
            break;
        default:
    }

    return notifications;
};

export const eventNotificationPostMiddleware = async (ctx: IRouterContext, next: any) => {
    try {
        const notifications = getNotifications(ctx.body);
        await notify('event', ctx.body._id, notifications);
        next();
    } catch (err) {
        ctx.logger.error(err);
    }
};

export const eventNotificationPatchMiddleware = async (ctx: IRouterContext, next: any) => {
    try {
        const notifications = getNotifications(ctx.body.data);
        await update('event', ctx.body.data._id, notifications);
        next();
    } catch (err) {
        ctx.logger.error(err);
    }
};

export const eventNotificationRemoveMiddleware = async (ctx: IRouterContext, next: any) => {
    try {
        const { id } = ctx.params;
        await remove('event', id);
        next();
    } catch (err) {
        ctx.logger.error(err);
    }
};
