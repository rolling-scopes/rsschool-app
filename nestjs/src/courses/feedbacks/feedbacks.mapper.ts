import { CreateStudentFeedbackDto } from './dto';
import { StudentFeedback } from '@entities/studentFeedback';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedbacksMapper {
  public convertToDto(entity: StudentFeedback): CreateStudentFeedbackDto {
    return {
      mentorId: entity.mentorId,
      recommendation: entity.recommendation,
      content: {
        gaps: entity.content.gaps,
        impression: entity.content.impression,
        recommendationComment: entity.content.recommendationComment,
      },
    };
  }

  public convertToEntity(studentId: number, dto: CreateStudentFeedbackDto): StudentFeedback {
    const entity = new StudentFeedback();
    entity.mentorId = dto.mentorId;
    entity.recommendation = dto.recommendation;
    entity.studentId = studentId;
    return entity;
  }
}
