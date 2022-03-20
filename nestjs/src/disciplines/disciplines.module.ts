import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discipline } from '@entities/discipline';
import { DisciplinesController } from './disciplines.controller';
import { DisciplinesService } from './disciplines.service';

@Module({
  imports: [TypeOrmModule.forFeature([Discipline])],
  controllers: [DisciplinesController],
  providers: [DisciplinesService],
})
export class DisciplinesModule {}
