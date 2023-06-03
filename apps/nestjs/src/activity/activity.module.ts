import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config';
import { UsersModule } from 'src/users';
import { ActivityController } from './activity.controller';

@Module({
  controllers: [ActivityController],
  imports: [UsersModule, ConfigModule],
})
export class ActivityModule {}
