import { Logger, Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule, Params } from 'nestjs-pino';
import cloudWatchStream from '@apalchys/pino-cloudwatch';
import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from './config';
import { LoggingMiddleware } from './core/middlewares';
import { CoursesModule } from './courses/courses.module';
import { DisciplinesModule } from './disciplines';
import config from './ormconfig';
import { ProfileModule } from './profile';
import { UsersModule } from './users';

const devMode = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: getPinoHttp(),
    }),
    TypeOrmModule.forRoot({
      ...config,
      autoLoadEntities: true,
    }),
    ConfigModule,
    AlertsModule,
    UsersModule,
    CoursesModule,
    AuthModule,
    ProfileModule,
    DisciplinesModule,
  ],
  controllers: [],
  providers: [Logger, ConfigService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
function getPinoHttp(): Params['pinoHttp'] {
  const pinoOptions = {
    base: {},
    autoLogging: false,
    quietReqLogger: true,
    prettyPrint: devMode ? { ignore: 'time,remoteAddress,req,reqId' } : false,
  };

  if (!devMode && process.env.RSSHCOOL_AWS_ACCESS_KEY_ID && process.env.RSSHCOOL_AWS_SECRET_ACCESS_KEY) {
    return [
      pinoOptions,
      cloudWatchStream({
        interval: 4000,
        aws_access_key_id: process.env.RSSHCOOL_AWS_ACCESS_KEY_ID,
        aws_secret_access_key: process.env.RSSHCOOL_AWS_SECRET_ACCESS_KEY,
        aws_region: process.env.RSSHCOOL_AWS_REGION,
        group: '/app/rsschool-api',
        stream: `${new Date().toISOString().split('T')[0]}-nestjs`,
      }),
    ];
  }

  return pinoOptions;
}
