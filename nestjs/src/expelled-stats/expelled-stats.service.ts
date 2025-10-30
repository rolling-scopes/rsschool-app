import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseLeaveSurveyResponse } from '../../../common/models/course-leave-survey-response';

@Injectable()
export class ExpelledStatsService {
  constructor(
    @InjectRepository(CourseLeaveSurveyResponse)
    private readonly surveyRepository: Repository<CourseLeaveSurveyResponse>,
  ) {}

  async findAll(): Promise<CourseLeaveSurveyResponse[]> {
    return this.surveyRepository.find({
      relations: ['user', 'course'],
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.surveyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Expelled stat with ID "${id}" not found`);
    }
  }

  async submitLeaveSurvey(
    userId: string,
    courseId: string,
    reasonForLeaving?: string[],
    otherComment?: string,
  ): Promise<CourseLeaveSurveyResponse> {
    const surveyResponse = this.surveyRepository.create({
      userId,
      courseId,
      reasonForLeaving,
      otherComment,
      submittedAt: new Date(),
    });
    return this.surveyRepository.save(surveyResponse);
  }
}
