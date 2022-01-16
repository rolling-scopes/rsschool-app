import { Logger, Module } from '@nestjs/common';
import { AlertsModule } from './alerts/alerts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import * as config from './ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(config), AlertsModule, AuthModule],
  controllers: [],
  providers: [Logger],
})
export class AppModule {}
