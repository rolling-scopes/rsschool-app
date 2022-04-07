import { Logger, Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';

import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from './config';
import { LoggingMiddleware, NoCacheMiddleware } from './core/middlewares';
import { getPinoHttp } from './core/pino';
import { CoursesModule } from './courses/courses.module';
import { DisciplinesModule } from './disciplines';
import { RegistryModule } from './registry/registry.module';
import { NotificationsModule } from './notifications/notifications.module';
import config from './ormconfig';
import { ProfileModule } from './profile';
import { UsersModule } from './users';
import { CertificatesModule } from './certificates/certificates.module';
import { DiscordServersModule } from './discord-servers/discord-servers.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { UserGroupsModule } from './userGroups/user-groups.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ActivityModule } from './activity/activity.module';
import { UsersNotificationsModule } from './users-notifications';
import { GratitudesModule } from './gratitudes';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: getPinoHttp(),
    }),
    TypeOrmModule.forRoot({
      ...config,
      autoLoadEntities: true,
    }),
    ActivityModule,
    ConfigModule,
    AlertsModule,
    UsersModule,
    CoursesModule,
    AuthModule,
    ProfileModule,
    DisciplinesModule,
    NotificationsModule,
    RegistryModule,
    CertificatesModule,
    DiscordServersModule,
    OpportunitiesModule,
    UserGroupsModule,
    ScheduleModule,
    UsersNotificationsModule,
    GratitudesModule,
  ],
  controllers: [],
  providers: [Logger, ConfigService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer.apply(NoCacheMiddleware).forRoutes({ path: '*/*', method: RequestMethod.GET });
  }
}
