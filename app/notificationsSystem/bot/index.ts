import Telegraf from 'telegraf';

import { ILogger } from '../../logger';

import { userService, notificationsSettingService } from '../../services';

import config from './config';

export default class NotificationsBot {
    private static getTelegramId = (ctx: any) => ctx.update.message.from.id;

    private static beautifyTime(time: string) {
        const [hours, minutes] = time.split(':').map(it => Number(it));

        return { hours, minutes };
    }

    private static argumentsMiddleware(ctx: any, next: any) {
        const [command, ...args] = ctx.message.text.split(' ').filter((it: string) => it !== '');
        ctx.state.command = command;
        ctx.state.arguments = args;

        return next();
    }

    private static async settingMiddleware(ctx: any, next: any) {
        const telegramId = NotificationsBot.getTelegramId(ctx);
        const result = await notificationsSettingService.getByTelegramId(telegramId);
        ctx.state.setting = result;
        return next();
    }

    private static unknownCommandMiddleware(ctx: any, next: any) {
        const isKnownCommand = config.knownCommands.has(ctx.state.command);

        if (isKnownCommand) {
            return next();
        }
        ctx.reply(config.messages.iDontUnderstandYou);
    }

    private static unknownUserMiddleware(ctx: any, next: any) {
        if (ctx.state.command === '/start' || ctx.state.setting) {
            return next();
        }

        ctx.reply(config.messages.iDontKnowYou);
    }

    private telegramBot: any;

    private logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
        this.telegramBot = new Telegraf(config.token);

        this.telegramBot.use(NotificationsBot.argumentsMiddleware);
        this.telegramBot.use(NotificationsBot.settingMiddleware);

        this.telegramBot.use(NotificationsBot.unknownUserMiddleware);
        this.telegramBot.use(NotificationsBot.unknownCommandMiddleware);

        this.telegramBot.start(this.handleStart);
        this.telegramBot.help(this.handleHelp);
        this.telegramBot.command('enable', this.handleEnable);
        this.telegramBot.command('disable', this.handleDisable);
        this.telegramBot.command('chooseevents', this.handleChooseEvents);
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
            const telegramId = NotificationsBot.getTelegramId(ctx);
            await notificationsSettingService.save({ userId, telegramId });
            ctx.reply(config.messages.subscribe);
        } else {
            ctx.reply(config.messages.iDontKnowYou);
        }
    }

    private handleHelp(ctx: any) {
        ctx.reply(config.messages.welcome);
    }

    private async handleEnable(ctx: any) {
        const telegramId = NotificationsBot.getTelegramId(ctx);
        await notificationsSettingService.update({ telegramId }, { isEnable: true });
        ctx.reply(config.messages.enable);
    }

    private async handleDisable(ctx: any) {
        const telegramId = NotificationsBot.getTelegramId(ctx);
        await notificationsSettingService.update({ telegramId }, { isEnable: false });
        ctx.reply(config.messages.disable);
    }

    private async handleSetTime(ctx: any) {
        try {
            const telegramId = NotificationsBot.getTelegramId(ctx);
            const [timeFrom, timeTo] = ctx.state.arguments;

            if (!(timeFrom && timeTo)) {
                ctx.reply(config.messages.invalidTimeInterval);
                return;
            }
            const beautyTimeFrom = NotificationsBot.beautifyTime(timeFrom);
            const beautyTimeTo = NotificationsBot.beautifyTime(timeTo);

            await notificationsSettingService.update(
                { telegramId },
                { timeFrom: beautyTimeFrom, timeTo: beautyTimeTo },
            );
            ctx.reply(config.messages.timeSetted);
        } catch (err) {
            ctx.reply(config.messages.invalidTimeInterval);
            this.logger.error(err);
        }
    }

    private handleChooseEvents(ctx: any) {
        ctx.reply(config.messages.chooseEvents);
    }

    private handleError(err: any) {
        this.logger.error(err);
    }
}
