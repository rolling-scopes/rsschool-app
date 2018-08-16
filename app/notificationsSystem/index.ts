import NotificationsBot from './NotificationsBot';
import { ILogger } from '../logger';

export default class NotificationsSystem {
    public logger: ILogger;

    private bot: NotificationsBot;

    constructor(logger: ILogger) {
        this.logger = logger;
        this.bot = new NotificationsBot(this);
        this.bot.start();
    }

    public start() {
        this.logger.info('Notification system started');
    }
}
