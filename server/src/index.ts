import cors from '@koa/cors';
import pinoLogger from 'pino';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import session from 'koa-session';
import serve from 'koa-static';
import koaJwt from 'koa-jwt';
import { Server } from 'net';

import { setupPassport } from './auth';
import { config } from './config';
import { ILogger, loggerMiddleware } from './logger';

import { createConnection } from 'typeorm';
import { models } from './models';
import { routesMiddleware, routeLoggerMiddleware } from './routes';
import { startBackgroundJobs } from './schedule';

const koaSwagger = require('koa2-swagger-ui'); //tslint:disable-line

function createDefaultLogger() {
  return pinoLogger({ name: config.name }) as ILogger;
}

export class App {
  private koa = new Koa();
  private appLogger: ILogger;
  private server: Server | undefined = undefined;

  constructor(logger: ILogger = createDefaultLogger()) {
    this.appLogger = logger.child({ module: 'app' });

    this.koa.use(loggerMiddleware(this.appLogger));

    this.koa.use(bodyParser({ jsonLimit: '20mb', enableTypes: ['json', 'form', 'text'] }));
    this.koa.use(cors());

    this.koa.keys = [config.sessionKey];

    this.koa.use(session({ maxAge: config.sessionAge }, this.koa));

    const passport = setupPassport(this.appLogger.child({ module: 'passport' }));
    this.koa.use(passport.initialize());
    this.koa.use(passport.session());

    this.koa.use(koaJwt({ key: 'user', secret: config.sessionKey, passthrough: true }));

    const routes = routesMiddleware(this.appLogger);

    this.koa.use(routes.publicRouter.routes());
    this.koa.use(routes.publicRouter.allowedMethods());

    this.koa.use(routeLoggerMiddleware);
    this.koa.use(serve('public'));
    this.koa.use(
      koaSwagger({
        routePrefix: '/swagger',
        swaggerOptions: {
          url: './swagger.yml',
        },
      }),
    );

    process.on('unhandledRejection', reason => this.appLogger.error(reason as any));
  }

  public start(): Server {
    this.server = this.koa.listen(config.port);
    this.appLogger.info(`Service is running on ${config.port} port`);
    return this.server;
  }

  public async pgConnect(): Promise<boolean> {
    await createConnection({
      type: 'postgres',
      host: config.pg.host,
      port: 5432,
      username: config.pg.username,
      password: config.pg.password,
      database: config.pg.database,
      entities: models,
      synchronize: true,
    });
    this.appLogger.info('Connected to Postgres');

    return true;
  }

  public async startBackgroundJobs() {
    return startBackgroundJobs(this.appLogger.child({ module: 'schedule' }));
  }
}
