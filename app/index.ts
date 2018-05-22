import * as cors from '@koa/cors';
import { createLogger } from 'bunyan';
import * as Koa from 'koa';
import * as koaBody from 'koa-body';
import * as serve from 'koa-static';
import * as mongoose from 'mongoose';

const koaSwagger = require('koa2-swagger-ui'); //tslint:disable-line
const SERVICE_NAME = 'rsschool-api';

import { config } from './config';
import { ILogger, loggerMiddleware } from './logger';
import { routesMiddleware } from './routes';

class App {
    private koa = new Koa();
    private logger: ILogger;

    private RETRY_ATTEMPTS = 5;
    private RECONNECT_DELAY = 5000;

    constructor() {
        this.logger = (createLogger({ name: SERVICE_NAME }) as ILogger).child({ module: 'app' });
        const routes = routesMiddleware(this.logger);

        this.koa.use(koaBody());
        this.koa.use(cors());
        this.koa.use(loggerMiddleware(this.logger.child({ module: 'middleware:logger' })));
        this.koa.use(routes.routes());
        this.koa.use(routes.allowedMethods());
        this.koa.use(serve('public'));
        this.koa.use(
            koaSwagger({
                routePrefix: '/swagger',
                swaggerOptions: {
                    url: '/swagger.yml',
                },
            }),
        );
    }

    public start() {
        const server = this.koa.listen(config.port);
        this.logger.info(`Service is running on ${config.port} port`);
        return server;
    }

    public connect() {
        this.connectToMongo().catch(error => {
            this.logger.error(error, 'Cannot connect to Mongo database');
            if (this.RETRY_ATTEMPTS > 0) {
                this.RETRY_ATTEMPTS--;
                this.logger.info(`Trying to re-connect in ${this.RECONNECT_DELAY / 1000} seconds`);
                setTimeout(() => this.connect(), this.RECONNECT_DELAY);
            } else {
                this.logger.error('Mongo database is not available. Shuting down..');
            }
        });
    }

    private connectToMongo() {
        const options: mongoose.ConnectionOptions = { keepAlive: 1 };
        mongoose.connection
            .on('error', e => this.logger.error(e, 'Mongo connection error'))
            .on('disconnected', () => this.connect())
            .once('open', () => this.logger.info(`Successfully connected to Mongo database`));
        return mongoose.connect(config.mongo.connectionString, options);
    }
}

export const app = new App();
