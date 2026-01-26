import { Module } from '@nestjs/common';
import { DevtoolsController } from './devtools.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevtoolsService } from './devtools.service';
import { TestUser } from './entities/testUser';

@Module({
  imports: [TypeOrmModule.forFeature([TestUser])],
  providers: [DevtoolsService],
  controllers: [DevtoolsController],
})
export class DevtoolsModule {}
