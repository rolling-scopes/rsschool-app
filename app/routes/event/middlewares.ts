import { IMiddleware } from 'koa-router';
import { SessionType } from '../../models/event';
import { StudentsEventsType } from '../../models/notification';
import { INotificaionData, notify, update, remove } from '../../notificationsSystem';

const hoursToMilliseconds = (hours: number): number => hours * 60 * 60 * 1000;

const getPrettyTime = (dateTime: Date): string => {
    return `${dateTime.getHours()}:${dateTime.getMinutes()}`;
};

const getNotifications = (data: any): INotificaionData[] => {
    const { _id, title, sessionType, startDateTime, urlToDescription } = data;

    const notifications = [];

    const beforeEventMessage = `${title} started at ${getPrettyTime(new Date(startDateTime))}${
        urlToDescription ? `\n${urlToDescription}` : ''
    }`;
    const onEventMessage = `${title} started${urlToDescription ? `\n${urlToDescription}` : ''}`;

    switch (sessionType) {
        case SessionType.Online:
            notifications.push(
                {
                    dateTime: startDateTime - hoursToMilliseconds(1),
                    message: beforeEventMessage,
                },
                {
                    dateTime: startDateTime,
                    message: onEventMessage,
                },
            );
            break;
        case SessionType.Offline:
            notifications.push({
                dateTime: startDateTime - hoursToMilliseconds(2),
                message: beforeEventMessage,
            });
            break;
        case SessionType.SelfLearning:
            notifications.push({
                dateTime: startDateTime,
                message: onEventMessage,
            });
            break;
        case SessionType.ExtraEvent:
            notifications.push({
                dateTime: startDateTime - hoursToMilliseconds(1),
                message: beforeEventMessage,
            });
            break;
        default:
    }
    return notifications.map(item => ({
        ...item,
        eventId: _id,
        eventType: StudentsEventsType.Session,
        role: 'student',
    }));
};

export const notificationPostMiddleware: IMiddleware = async (ctx, next) => {
    try {
        const notifications = getNotifications(ctx.body);

        await notify(notifications, ctx.body.courseId);
        next();
    } catch (err) {
        ctx.logger.error(err, 'Failed to create notifications');
    }
};

export const notificationPatchMiddleware: IMiddleware = async (ctx, next) => {
    try {
        const notifications = getNotifications(ctx.body.data);

        await update(notifications, ctx.body.data.courseId);
        next();
    } catch (err) {
        ctx.logger.error(err, 'Failed to update notifications');
    }
};

export const notificationRemoveMiddleware: IMiddleware = async (ctx, next) => {
    try {
        const { id } = ctx.params;
        await remove(StudentsEventsType.Session, id);
        next();
    } catch (err) {
        ctx.logger.error(err, 'Failed to remove notifications');
    }
};
