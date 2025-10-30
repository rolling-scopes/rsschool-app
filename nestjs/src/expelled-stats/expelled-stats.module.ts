import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpelledStatsController } from './expelled-stats.controller';
import { ExpelledStatsService } from './expelled-stats.service';
import { CourseLeaveSurveyResponse } from './entities/course-leave-survey-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseLeaveSurveyResponse])],
  controllers: [ExpelledStatsController],
  providers: [ExpelledStatsService],
})
export class ExpelledStatsModule {}
