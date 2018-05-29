import * as cors from '@koa/cors';
import { createLogger } from 'bunyan';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';
import * as serve from 'koa-static';
import * as mongoose from 'mongoose';
import { Server } from 'net';
import { setupPassport } from './auth';
import { config } from './config';
import { ILogger, loggerMiddleware } from './logger';
import { routesMiddleware } from './routes';

const koaSwagger = require('koa2-swagger-ui'); //tslint:disable-line

function delay(ms = 0): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    });
}
function createDefaultLogger() {
    return createLogger({ name: config.name }) as ILogger;
}

export class App {
    private MONGO_CONNECT_ATTEMPTS = config.mongo.connectAttempts;
    private RECONNECT_DELAY = config.mongo.reconnectDelayMs;

    private koa = new Koa();
    private appLogger: ILogger;
    private mongoLogger: ILogger;
    private server: Server | undefined = undefined;

    constructor(logger: ILogger = createDefaultLogger()) {
        this.appLogger = logger.child({ module: 'app' });
        this.mongoLogger = this.appLogger.child({ module: 'mongodb' });

        const routes = routesMiddleware(this.appLogger);

        this.koa.use(bodyParser());
        this.koa.use(cors());
        this.koa.keys = [config.sessionKey];
        this.koa.use(session({}, this.koa));

        const passport = setupPassport(this.appLogger);
        this.koa.use(passport.initialize());
        this.koa.use(passport.session());

        this.koa.use(loggerMiddleware(this.appLogger.child({ module: 'middleware:logger' })));
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

    public start(): Server {
        this.server = this.koa.listen(config.port);
        this.appLogger.info(`Service is running on ${config.port} port`);
        return this.server;
    }

    public connect(): Promise<boolean> {
        if (this.server === undefined) {
            this.appLogger.info('Please start the app using start() method');
            return Promise.resolve(false);
        }
        if (this.MONGO_CONNECT_ATTEMPTS <= 0) {
            return Promise.resolve(true);
        }

        return this.connectToMongo()
            .then(_ => {
                this.mongoLogger.info(`Connected to MongoDB (${mongoose.connection.db.databaseName})`);
                return true;
            })
            .catch((err: Error) => {
                this.mongoLogger.error(err, 'Cannot connect to MongoDB');
                return this.reconnect();
            });
    }

    private reconnect() {
        if (this.MONGO_CONNECT_ATTEMPTS > 0) {
            this.MONGO_CONNECT_ATTEMPTS--;
            this.mongoLogger.info(`Re-connecting to MongoDB in ${this.RECONNECT_DELAY / 1000} seconds`);
            return delay(this.RECONNECT_DELAY).then(() => this.connect());
        } else {
            this.mongoLogger.error('MongoDB is not available');
            return Promise.resolve(false);
        }
    }

    private connectToMongo(): Promise<typeof mongoose> {
        this.mongoLogger.info('Connecting to MongoDB');
        return mongoose.connect(config.mongo.connectionString, config.mongo.options);
    }
}
