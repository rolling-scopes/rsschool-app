import { Logger, Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from './config';
import { LoggerMiddleware } from './core/logging';
import { CoursesModule } from './courses/courses.module';
import { DisciplinesModule } from './disciplines';
import * as config from './ormconfig';
import { ProfileModule } from './profile';
import { UsersModule } from './users';

const devMode = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        prettyPrint: devMode ? { ignore: 'time,hostname,pid,host,remoteAddress,req' } : false,
      },
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
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
