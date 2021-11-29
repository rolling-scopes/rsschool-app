import { Recommendation, StudentFeedback } from '@entities/student-feedback';
import { ApiResponse } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNotEmptyObject } from 'class-validator';
import { PersonDto } from '../../../core/dto';
import { StudentFeedbackContentDto } from './create-student-feedback.dto';
@ApiResponse({})
export class StudentFeedbackDto {
  constructor(studentFeedback: StudentFeedback) {
    this.content = studentFeedback.content;
    this.recommendation = studentFeedback.recommendation;
    this.author = new PersonDto(studentFeedback.author);
    this.mentor = studentFeedback.mentor ? new PersonDto(studentFeedback.mentor) : null;
    this.id = studentFeedback.id;
    this.createdDate = studentFeedback.createdDate;
    this.updatedDate = studentFeedback.updatedDate;
  }

  id: number;

  createdDate: string;

  updatedDate: string;

  @IsNotEmptyObject()
  content: StudentFeedbackContentDto;

  @IsEnum(Recommendation)
  @IsNotEmpty()
  recommendation: Recommendation;

  @IsNotEmptyObject()
  author: PersonDto;

  mentor?: PersonDto;
}
