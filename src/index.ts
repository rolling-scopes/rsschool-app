import * as cors from '@koa/cors';
import * as pinoLogger from 'pino';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';
import * as serve from 'koa-static';
import { RateLimit } from 'koa2-ratelimit';
import { Server } from 'net';

import { setupPassport } from './auth';
import { config } from './config';
import { ILogger, loggerMiddleware } from './logger';

import { createConnection } from 'typeorm';
import { models } from './models';
import { routesMiddleware, routeLoggerMiddleware } from './routes';

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

    this.koa.use(
      RateLimit.middleware({
        getUserId: async ctx => {
          const user = ctx.state && ctx.state.user ? ctx.state.user : {};
          return user.id;
        },
        interval: { min: config.rateLimit.intervalMin }, // 15 minutes = 15*60*1000
        max: config.rateLimit.max, // limit each IP to 100 requests per interval
      }),
    );

    this.koa.use(bodyParser({ jsonLimit: '20mb', enableTypes: ['json', 'form', 'text'] }));
    this.koa.use(cors());

    this.koa.keys = [config.sessionKey];

    const maxAge = 1000 * 60 * 60 * 24 * 5; // 5 days
    this.koa.use(session({ maxAge }, this.koa));

    const passport = setupPassport(this.appLogger.child({ module: 'passport' }));
    this.koa.use(passport.initialize());
    this.koa.use(passport.session());

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
}
