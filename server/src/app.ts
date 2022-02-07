import cors from '@koa/cors';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import koaJwt from 'koa-jwt';
import { paginateMiddleware } from 'koa-typeorm-pagination';

import { config } from './config';
import { ILogger, loggerMiddleware, createDefaultLogger } from './logger';

import { createConnection } from 'typeorm';
import { routesMiddleware, routeLoggerMiddleware } from './routes';
import { startBackgroundJobs } from './schedule';
import * as pgConfig from './ormconfig';

export class App {
  public koa = new Koa();
  private appLogger: ILogger;

  constructor(logger: ILogger = createDefaultLogger()) {
    this.appLogger = logger;

    this.koa.use(loggerMiddleware(this.appLogger));
    this.koa.use(paginateMiddleware);

    this.koa.use(bodyParser({ jsonLimit: '20mb', enableTypes: ['json', 'form', 'text'] }));
    this.koa.use(cors());

    this.koa.use(
      koaJwt({ key: 'user', cookie: 'auth-token', secret: config.sessionKey, debug: true, passthrough: true }),
    );

    process.on('unhandledRejection', reason => this.appLogger.error(reason as any));
  }

  public start(skipListen = false) {
    const routes = routesMiddleware(this.appLogger);

    this.koa.use(routes.publicRouter.routes());
    this.koa.use(routes.publicRouter.allowedMethods());

    this.koa.use(routeLoggerMiddleware);
    this.koa.use(serve('public'));

    if (skipListen) {
      this.koa.listen(config.port);
      this.appLogger.info(`Service is running on ${config.port} port`);
    }
    return this.koa;
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
