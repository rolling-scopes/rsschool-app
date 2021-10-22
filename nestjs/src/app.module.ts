import { Module } from '@nestjs/common';
import { AlertsModule } from './alerts/alerts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from './ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(config), AlertsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
