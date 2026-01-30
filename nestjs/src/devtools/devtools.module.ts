import { Module } from '@nestjs/common';
import { DevtoolsController } from './devtools.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevtoolsService } from './devtools.service';
import { User } from '@entities/user';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [DevtoolsService],
  controllers: [DevtoolsController],
})
export class DevtoolsModule {}
