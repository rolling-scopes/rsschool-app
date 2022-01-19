import { Logger, Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule, Params } from 'nestjs-pino';

import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from './config';
import { LoggingMiddleware, NoCacheMiddleware } from './core/middlewares';
import { getPinoHttp } from './core/pino';
import { CoursesModule } from './courses/courses.module';
import { DisciplinesModule } from './disciplines';
import config from './ormconfig';
import { ProfileModule } from './profile';
import { UsersModule } from './users';

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
    consumer.apply(NoCacheMiddleware).forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
