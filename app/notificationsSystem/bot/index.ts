import Telegraf from 'telegraf';

import { ILogger } from '../../logger';
import { ITime } from '../../models/notificationsSetting';
import { userService, notificationsSettingService } from '../../services';
import { config } from './config';

export default class NotificationsBot {
    private static beautifyTime(time: string): ITime | null {
        const [hours, minutes] = time.split(':').map(it => Number(it));

        if (isNaN(hours) || isNaN(minutes)) {
            return null;
        } else if (hours < 0 || hours > 24 || minutes < 0 || minutes > 60) {
            return null;
        }

        return { hours, minutes };
    }

    private static argumentsMiddleware(ctx: any, next: any) {
        if (!ctx.message.text) {
            ctx.reply(config.messages.iDontUnderstandYou);
            return;
        }

        const [command, ...args] = ctx.message.text.split(' ').filter((it: string) => it !== '');
        ctx.state.command = command;
        ctx.state.arguments = args;

        return next();
    }

    private static async settingMiddleware(ctx: any, next: any) {
        const setting = await notificationsSettingService.getByTelegramId(ctx.from.id);

        if (ctx.state.command === '/start' || setting) {
            ctx.state.setting = setting;
            return next();
        }

        ctx.reply(config.messages.iDontKnowYou);
    }

    private static unknownCommandMiddleware(ctx: any, next: any) {
        const isKnownCommand = config.knownCommands.some(item => item === ctx.state.command);

        if (isKnownCommand) {
            return next();
        }

        ctx.reply(config.messages.iDontUnderstandYou);
    }

    private telegramBot: any;

    private logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
        this.telegramBot = new Telegraf(config.token);

        this.telegramBot.use(NotificationsBot.argumentsMiddleware);
        this.telegramBot.use(NotificationsBot.settingMiddleware);
        this.telegramBot.use(NotificationsBot.unknownCommandMiddleware);

        this.telegramBot.start(this.handleStart);
        this.telegramBot.help(this.handleHelp);
        this.telegramBot.command('enable', this.handleEnable);
        this.telegramBot.command('disable', this.handleDisable);
        this.telegramBot.command('settime', this.handleSetTime.bind(this));

        this.telegramBot.catch(this.handleError.bind(this));
    }

    public start() {
        this.telegramBot.startPolling();
    }

    public stop() {
        this.telegramBot.stop();
    }

    public send(telegramId: number, message: string) {
        this.telegramBot.telegram.sendMessage(telegramId, message);
    }

    private async handleStart(ctx: any) {
        const userId = ctx.state.arguments[0];
        const { setting } = ctx.state;

        if (setting) {
            ctx.reply(config.messages.welcome);
            return;
        }

        const user = await userService.getUserById(userId);

        if (user) {
            await notificationsSettingService.save({ user: user._id, telegramId: ctx.from.id });
            ctx.reply(config.messages.subscribe);
        } else {
            ctx.reply(config.messages.iDontKnowYou);
        }
    }

    private handleHelp(ctx: any) {
        ctx.reply(config.messages.welcome);
    }

    private async handleEnable(ctx: any) {
        await notificationsSettingService.updateById(ctx.state.setting._id, { isEnable: true });
        ctx.reply(config.messages.enable);
    }

    private async handleDisable(ctx: any) {
        await notificationsSettingService.updateById(ctx.state.setting._id, { isEnable: false });
        ctx.reply(config.messages.disable);
    }

    private async handleSetTime(ctx: any) {
        const [timeFrom, timeTo] = ctx.state.arguments;

        if (!(timeFrom && timeTo)) {
            ctx.reply(config.messages.invalidTimeInterval);
            return;
        }
        const beautyTimeFrom = NotificationsBot.beautifyTime(timeFrom);
        const beautyTimeTo = NotificationsBot.beautifyTime(timeTo);

        if (beautyTimeFrom === null || beautyTimeTo === null) {
            ctx.reply(config.messages.invalidTimeInterval);
            return;
        } else if (beautyTimeFrom.hours > beautyTimeTo.hours) {
            ctx.reply(config.messages.invalidTimeInterval);
            return;
        }

        await notificationsSettingService.updateById(ctx.state.setting._id, {
            timeFrom: beautyTimeFrom,
            timeTo: beautyTimeTo,
        });
        ctx.reply(config.messages.timeSetted);
    }

    private handleError(err: Error) {
        this.logger.error(err);
    }
}
