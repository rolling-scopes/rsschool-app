import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseLeaveSurveyResponse } from '@entities/index';

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

  async findByCourseId(courseId: number): Promise<CourseLeaveSurveyResponse[]> {
    return this.surveyRepository.find({
      where: { courseId },
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
    userId: number,
    courseId: number,
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
