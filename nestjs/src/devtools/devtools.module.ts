import { Module } from '@nestjs/common';
import { DevtoolsController } from './devtools.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestUser } from '../models/testUser';
import { DevtoolsService } from './devtools.service';

@Module({
  imports: [TypeOrmModule.forFeature([TestUser])],
  providers: [DevtoolsService],
  controllers: [DevtoolsController],
})
export class DevtoolsModule {}
