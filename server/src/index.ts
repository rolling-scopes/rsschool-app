import cors from '@koa/cors';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import session from 'koa-session';
import serve from 'koa-static';
import koaJwt from 'koa-jwt';
import { paginateMiddleware } from 'koa-typeorm-pagination';
import { Server } from 'net';

import { setupPassport } from './auth';
import { config } from './config';
import { ILogger, loggerMiddleware, createDefaultLogger } from './logger';

import { createConnection } from 'typeorm';
// import { models } from './models';
import { routesMiddleware, routeLoggerMiddleware } from './routes';
import { startBackgroundJobs } from './schedule';
import * as pgConfig from './ormconfig';

export class App {
  private koa = new Koa();
  private appLogger: ILogger;
  private server: Server | undefined = undefined;

  constructor(logger: ILogger = createDefaultLogger()) {
    this.appLogger = logger;

    this.koa.use(loggerMiddleware(this.appLogger));
    this.koa.use(paginateMiddleware);

    this.koa.use(bodyParser({ jsonLimit: '20mb', enableTypes: ['json', 'form', 'text'] }));
    this.koa.use(cors());

    this.koa.keys = [config.sessionKey];

    this.koa.use(session({ maxAge: config.sessionAge, renew: true }, this.koa));

    const passport = setupPassport(this.appLogger.child({ module: 'passport' }));
    this.koa.use(passport.initialize());
    this.koa.use(passport.session());

    this.koa.use(koaJwt({ key: 'user', secret: config.sessionKey, passthrough: true }));

    process.on('unhandledRejection', reason => this.appLogger.error(reason as any));
  }

  public start(): Server {
    const routes = routesMiddleware(this.appLogger);

    this.koa.use(routes.publicRouter.routes());
    this.koa.use(routes.publicRouter.allowedMethods());

    this.koa.use(routeLoggerMiddleware);
    this.koa.use(serve('public'));

    this.server = this.koa.listen(config.port);
    this.appLogger.info(`Service is running on ${config.port} port`);
    return this.server;
  }

  public async pgConnect(): Promise<boolean> {
    const logger = this.appLogger.child({ module: 'db' });
    const connection = await createConnection(pgConfig);
    logger.info('Connected to Postgres');

    logger.info('Executing migrations...');
    await connection.runMigrations();
    logger.info('Migrations executed successfully');

    return true;
  }

  public async startBackgroundJobs() {
    if (process.env.NODE_ENV !== 'production') {
      return Promise.resolve();
    }
    return startBackgroundJobs(this.appLogger.child({ module: 'schedule' }));
  }
}
