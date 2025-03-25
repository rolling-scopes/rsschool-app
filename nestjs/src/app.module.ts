import { Logger, Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
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
import { CrossCheckModule } from './cross-check/cross-check.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { UserGroupsModule } from './user-groups/user-groups.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ActivityModule } from './activity/activity.module';
import { UsersNotificationsModule } from './users-notifications';
import { GratitudesModule } from './gratitudes';
import { CloudApiModule } from './cloud-api/cloud-api.module';
import { EventsModule } from './events/events.module';
import { TasksModule } from './tasks/tasks.module';
import { PromptsModule } from './prompts/prompts.module';
import { AutoTestModule } from './auto-test/auto-test.module';
import { ContributorsModule } from './contributors';
import { ListenersModule } from './listeners';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: getPinoHttp(),
    }),
    TypeOrmModule.forRoot({
      ...config,
      autoLoadEntities: true,
    }),
    EventEmitterModule.forRoot({
      delimiter: '.',
      wildcard: true,
    }),
    NestScheduleModule.forRoot(),
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
    CrossCheckModule,
    OpportunitiesModule,
    UserGroupsModule,
    ScheduleModule,
    UsersNotificationsModule,
    GratitudesModule,
    CloudApiModule,
    EventsModule,
    TasksModule,
    PromptsModule,
    AutoTestModule,
    ContributorsModule,
    ListenersModule,
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
