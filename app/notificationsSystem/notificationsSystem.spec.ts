import mockingoose from 'mockingoose';
import * as nodeSchedule from 'node-schedule';

import { StudentsNotificationsType } from '../models/notification';
import { UserModel } from '../models/user';

import { ILogger } from '../logger';
import * as notificationsSystem from '.';
import Bot from './bot';

jest.mock('./bot/index');

const mockLogger = {} as ILogger;
mockLogger.error = () => undefined;
mockLogger.info = () => undefined;
mockLogger.warn = () => undefined;

const courseId = 'rs-course-2018-1';
const eventId = '5b79dd800755343b00c67b19';

const mockSend = jest.fn();

let mentorSetting: any;
let studentSetting: any;

let mentor: any;
let student: any;

const checkIsNotificationSend = () => {
    expect(Object.keys(nodeSchedule.scheduledJobs).length).toBe(0);
    expect(mockSend.mock.calls.length).toBe(1);
};

const checkIsNotificationSchedule = () => {
    expect(Object.keys(nodeSchedule.scheduledJobs).length).toBe(1);
    expect(mockSend.mock.calls.length).toBe(0);
};

const checkIsNotNotify = () => {
    expect(Object.keys(nodeSchedule.scheduledJobs).length).toBe(0);
    expect(mockSend.mock.calls.length).toBe(0);
};

describe('Notification system', () => {
    beforeAll(async () => {
        const studentModel = new UserModel({
            _id: 'brody.moen19',
            isAdmin: false,
            participations: [{ courseId, isActive: true, role: 'student' }],
            profile: {
                city: 'mogilev',
                firstName: 'Victor',
                githubId: 'brody.moen19',
                lastName: 'Stamm',
            },
            role: 'student',
        });

        const mentorModel = new UserModel({
            _id: 'eddie79',
            isAdmin: false,
            participations: [{ courseId, isActive: true, role: 'mentor' }],
            profile: {
                city: 'minsk',
                firstName: 'Edyth',
                githubId: 'eddie79',
                lastName: 'Hills',
            },
            role: 'mentor',
        });

        student = await studentModel.save();
        mentor = await mentorModel.save();

        Bot.prototype.send = mockSend;

        mockingoose.Notification.toReturn([], 'find');

        notificationsSystem.start(mockLogger);
    });

    beforeEach(async () => {
        studentSetting = {
            events: ['all'],
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
            user: student,
        };

        mentorSetting = {
            events: ['all'],
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
            user: mentor,
        };

        mockingoose.NotificationsSetting.toReturn([studentSetting, mentorSetting], 'find');

        mockSend.mockReset();

        Object.values(nodeSchedule.scheduledJobs).forEach(item => item.cancel());
    });

    it('should not notify when event in the past', async () => {
        await notificationsSystem.notify(
            [
                {
                    dateTime: Date.now() - 10000,
                    eventId,
                    eventType: StudentsNotificationsType.Session,
                    message: 'Event in the past',
                    role: 'student',
                },
            ],
            courseId,
        );

        checkIsNotNotify();
    });

    it('should not notify when event time not in a setting time interval', async () => {
        studentSetting.timeFrom = {
            hours: 12,
            minutes: 0,
        };

        const currentDate = new Date();

        await notificationsSystem.notify(
            [
                {
                    dateTime: new Date(`${currentDate.getFullYear() + 1}-01-01 11:00`).valueOf(),
                    eventId,
                    eventType: StudentsNotificationsType.Session,
                    message: 'Event comes when settings not allowed',
                    role: 'student',
                },
            ],
            courseId,
        );

        checkIsNotNotify();
    });

    it('should not notify when role does not match', async () => {
        mockingoose.NotificationsSetting.toReturn([studentSetting], 'find');

        await notificationsSystem.notify(
            [
                {
                    eventId,
                    eventType: StudentsNotificationsType.Session,
                    message: 'Immediate notification',
                    role: 'mentor',
                },
            ],
            courseId,
        );

        checkIsNotNotify();
    });

    it('should immediately notify', async () => {
        await notificationsSystem.notify(
            [
                {
                    eventId,
                    eventType: StudentsNotificationsType.Session,
                    message: 'Immediate notification',
                    role: 'student',
                },
            ],
            courseId,
        );

        checkIsNotificationSend();
    });

    it('should schedule on event dateTime', async () => {
        await notificationsSystem.notify(
            [
                {
                    dateTime: Date.now() + 10000,
                    eventId,
                    eventType: StudentsNotificationsType.Session,
                    message: 'Scheduled notification',
                    role: 'student',
                },
            ],
            courseId,
        );

        checkIsNotificationSchedule();
    });

    it('should schedule on setting time', async () => {
        const currentDate = new Date();

        if (currentDate.getHours() === 0 || currentDate.getHours() === 1) {
            studentSetting.timeFrom.hours = 2;
        } else {
            studentSetting.timeTo.hours = currentDate.getHours() - 1;
        }

        await notificationsSystem.notify(
            [
                {
                    eventId,
                    eventType: StudentsNotificationsType.Session,
                    message: 'Immediate notification',
                    role: 'student',
                },
            ],
            courseId,
        );

        checkIsNotificationSchedule();
    });

    it('should notify when specific event in settings', async () => {
        studentSetting.events = [StudentsNotificationsType.Deadline];

        await notificationsSystem.notify(
            [
                {
                    eventId,
                    eventType: StudentsNotificationsType.Deadline,
                    message: 'Immediate notification',
                    role: 'student',
                },
            ],
            courseId,
        );

        checkIsNotificationSend();
    });

    it('should not notify when specific event not in settings', async () => {
        studentSetting.events = [StudentsNotificationsType.Deadline];

        await notificationsSystem.notify(
            [
                {
                    eventId,
                    eventType: StudentsNotificationsType.Session,
                    message: 'Immediate notification',
                    role: 'student',
                },
            ],
            courseId,
        );

        checkIsNotNotify();
    });

    it('should remove notifications', async () => {
        const data = {
            dateTime: Date.now() + 10000,
            eventId,
            eventType: StudentsNotificationsType.Session,
            message: 'Scheduled notification',
            role: 'student',
        };

        const notification = {
            _id: '5b7e8f7042991714f821bc6a',
            dateTime: data.dateTime,
            eventId: data.eventId,
            eventType: data.eventType,
            message: data.message,
            telegramId: studentSetting.telegramId,
        };

        mockingoose.Notification.toReturn([notification], 'find');
        mockingoose.Notification.toReturn(notification, 'save');

        await notificationsSystem.notify([data], courseId);

        checkIsNotificationSchedule();

        await notificationsSystem.remove(StudentsNotificationsType.Session, data.eventId);

        expect(Object.keys(nodeSchedule.scheduledJobs).length).toEqual(0);
    });

    it('should update notifications', async () => {
        const data = {
            dateTime: Date.now() + 10000,
            eventId,
            eventType: StudentsNotificationsType.Session,
            message: 'Scheduled notification',
            role: 'student',
        };

        const notification = {
            _id: '5b7e8f7042991714f821bc6a',
            dateTime: data.dateTime,
            eventId: data.eventId,
            eventType: data.eventType,
            message: data.message,
            telegramId: studentSetting.telegramId,
        };

        mockingoose.Notification.toReturn([notification], 'find');
        mockingoose.Notification.toReturn(notification, 'save');

        await notificationsSystem.notify([data], courseId);

        checkIsNotificationSchedule();

        await notificationsSystem.update(
            [
                {
                    eventId: data.eventId,
                    eventType: data.eventType,
                    message: 'Immediate notification',
                    role: 'student',
                },
            ],
            courseId,
        );

        checkIsNotificationSend();
    });

    it('should cancel scheduled notifications when system stop', async () => {
        await notificationsSystem.notify(
            [
                {
                    dateTime: Date.now() + 10000,
                    eventId,
                    eventType: StudentsNotificationsType.Session,
                    message: 'Scheduled notification',
                    role: 'student',
                },
            ],
            courseId,
        );

        checkIsNotificationSchedule();

        notificationsSystem.stop();

        expect(Object.keys(nodeSchedule.scheduledJobs).length).toEqual(0);
    });

    it('should schedule notifications when system start', async () => {
        notificationsSystem.stop();

        expect(Object.keys(nodeSchedule.scheduledJobs).length).toEqual(0);

        const notification = {
            _id: '5b7e8f7042991714f821bc6a',
            dateTime: Date.now() + 100000,
            eventId,
            eventType: StudentsNotificationsType.Deadline,
            message: 'Some message',
            telegramId: studentSetting.telegramId,
        };

        mockingoose.Notification.toReturn([notification], 'find');

        await notificationsSystem.start(mockLogger);

        checkIsNotificationSchedule();
    });

    // should notify single user
});
