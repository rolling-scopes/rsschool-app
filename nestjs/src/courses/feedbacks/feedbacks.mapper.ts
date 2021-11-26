import { CrudDtoMapper } from '../../core/crud-dto.mapper';
import { CreateStudentFeedbackDto } from './dto';
import { StudentFeedback } from '@entities/studentFeedback';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedbacksMapper extends CrudDtoMapper<CreateStudentFeedbackDto, StudentFeedback> {
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

  public convertToEntity(dto: CreateStudentFeedbackDto): StudentFeedback {
    const entity = new StudentFeedback();
    entity.mentorId = dto.mentorId;
    entity.recommendation = dto.recommendation;
    return entity;
  }
}
