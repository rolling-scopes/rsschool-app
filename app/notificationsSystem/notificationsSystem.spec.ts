import mockingoose from 'mockingoose';
import * as nodeSchedule from 'node-schedule';

import { StudentsNotificationsType } from '../models/notification';
import { ILogger } from '../logger';
import * as notificationsSystem from '.';
import Bot from './bot';

jest.mock('./bot/index');

const mockSend = jest.fn();

let setting: any;

describe('Notification system', () => {
    beforeAll(() => {
        Bot.prototype.send = mockSend;

        const mockLogger = {} as ILogger;
        mockLogger.error = () => undefined;
        mockLogger.info = () => undefined;
        mockLogger.warn = () => undefined;

        mockingoose.Notification.toReturn([], 'find');

        notificationsSystem.start(mockLogger);
    });

    beforeEach(() => {
        setting = {
            isEnable: true,
            telegramId: 123456654321,
            timeFrom: {
                hours: 0,
                minutes: 0,
            },
            timeTo: {
                hours: 24,
                minutes: 0,
            },
            userId: '5b7e8f7042991714f821bc6a',
        };

        mockingoose.NotificationsSetting.toReturn([setting], 'find');

        mockSend.mockReset();

        Object.values(nodeSchedule.scheduledJobs).forEach(item => item.cancel());
    });

    it('should not notify when event in the past', async () => {
        await notificationsSystem.notify([
            {
                dateTime: Date.now() - 10000,
                eventId: '5b79dd800755343b00c67b19',
                eventType: StudentsNotificationsType.Session,
                message: 'Event in the past',
            },
        ]);

        expect(Object.keys(nodeSchedule.scheduledJobs).length).toEqual(0);
        expect(mockSend.mock.calls.length).toBe(0);
    });

    it('should not notify when event time not in a setting time interval', async () => {
        setting.timeFrom = {
            hours: 12,
            minutes: 0,
        };

        const currentDate = new Date();

        await notificationsSystem.notify([
            {
                dateTime: new Date(`${currentDate.getFullYear() + 1}-01-01 11:00`).valueOf(),
                eventId: '5b79dd800755343b00c67b19',
                eventType: StudentsNotificationsType.Session,
                message: 'Event comes when settings not allowed',
            },
        ]);

        expect(Object.keys(nodeSchedule.scheduledJobs).length).toEqual(0);
        expect(mockSend.mock.calls.length).toBe(0);
    });

    it('should immediately notify', async () => {
        await notificationsSystem.notify([
            {
                eventId: '5b79dd800755343b00c67b19',
                eventType: StudentsNotificationsType.Session,
                message: 'Immediate notification',
            },
        ]);

        expect(Object.keys(nodeSchedule.scheduledJobs).length).toBe(0);
        expect(mockSend.mock.calls.length).toBe(1);
    });

    it('should schedule on event dateTime', async () => {
        await notificationsSystem.notify([
            {
                dateTime: Date.now() + 10000,
                eventId: '5b79dd800755343b00c67b19',
                eventType: StudentsNotificationsType.Session,
                message: 'Scheduled notification',
            },
        ]);

        expect(Object.keys(nodeSchedule.scheduledJobs).length).toEqual(1);
    });

    it('should schedule on setting time', async () => {
        const currentDate = new Date();

        if (currentDate.getHours() === 0 || currentDate.getHours() === 1) {
            setting.timeFrom.hours = 2;
        } else {
            setting.timeTo.hours = currentDate.getHours() - 1;
        }

        await notificationsSystem.notify([
            {
                eventId: '5b79dd800755343b00c67b19',
                eventType: StudentsNotificationsType.Session,
                message: 'Immediate notification',
            },
        ]);

        expect(Object.keys(nodeSchedule.scheduledJobs).length).toEqual(1);
        expect(mockSend.mock.calls.length).toBe(0);
    });

    it('should remove notifications', async () => {
        const data = {
            dateTime: Date.now() + 10000,
            eventId: '5b79dd800755343b00c67b19',
            eventType: StudentsNotificationsType.Session,
            message: 'Scheduled notification',
        };

        const notification = {
            _id: '5b7e8f7042991714f821bc6a',
            dateTime: data.dateTime,
            eventId: 'eventId',
            eventName: 'eventName',
            message: data.message,
            telegramId: setting.telegramId,
        };

        mockingoose.Notification.toReturn([notification], 'find');
        mockingoose.Notification.toReturn(notification, 'save');

        await notificationsSystem.notify([data]);

        expect(Object.keys(nodeSchedule.scheduledJobs).length).toEqual(1);

        await notificationsSystem.remove(StudentsNotificationsType.Session, data.eventId);

        expect(Object.keys(nodeSchedule.scheduledJobs).length).toEqual(0);
    });

    it('should update notifications', async () => {
        const data = {
            dateTime: Date.now() + 10000,
            eventId: '5b79dd800755343b00c67b19',
            eventType: StudentsNotificationsType.Session,
            message: 'Scheduled notification',
        };

        const notification = {
            _id: '5b7e8f7042991714f821bc6a',
            dateTime: data.dateTime,
            eventId: 'eventId',
            eventName: 'eventName',
            message: data.message,
            telegramId: setting.telegramId,
        };

        mockingoose.Notification.toReturn([notification], 'find');
        mockingoose.Notification.toReturn(notification, 'save');

        await notificationsSystem.notify([data]);

        expect(Object.keys(nodeSchedule.scheduledJobs).length).toEqual(1);

        await notificationsSystem.update([
            {
                eventId: data.eventType,
                eventType: data.eventType,
                message: 'Immediate notification',
            },
        ]);

        expect(Object.keys(nodeSchedule.scheduledJobs).length).toEqual(0);
        expect(mockSend.mock.calls.length).toBe(1);
    });
});
