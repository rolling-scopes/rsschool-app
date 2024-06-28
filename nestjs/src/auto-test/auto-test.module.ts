import { Task } from '@entities/index';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoTestController } from './auto-test.controller';
import { AutoTestService } from './auto-test.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [AutoTestController],
  providers: [AutoTestService],
})
export class AutoTestModule {}
