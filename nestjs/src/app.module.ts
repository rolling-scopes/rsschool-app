import { Logger, Module } from '@nestjs/common';
import { AlertsModule } from './alerts/alerts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import * as config from './ormconfig';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { ConfigModule } from './config';
import { ConfigService } from './config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...config,
      autoLoadEntities: true,
    }),
    ConfigModule,
    AlertsModule,
    UserModule,
    CourseModule,
    AuthModule,
  ],
  controllers: [],
  providers: [Logger, ConfigService],
})
export class AppModule {}
