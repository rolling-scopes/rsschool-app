import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from './config';
import { CourseModule } from './course/course.module';
import * as config from './ormconfig';
import { ProfileModule } from './profile';
import { UserModule } from './user/user.module';

const devMode = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        prettyPrint: devMode ? { ignore: 'time,hostname,pid,host,remoteAddress' } : false,
      },
    }),
    TypeOrmModule.forRoot({
      ...config,
      autoLoadEntities: true,
    }),
    ConfigModule,
    AlertsModule,
    UserModule,
    CourseModule,
    AuthModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [Logger, ConfigService],
})
export class AppModule {}
