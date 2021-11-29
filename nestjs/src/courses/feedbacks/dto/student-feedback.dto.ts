import { Recommendation, StudentFeedback } from '@entities/student-feedback';
import { ApiResponse } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNotEmptyObject } from 'class-validator';
import { LanguageLevel } from 'src/data';
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
    this.englishLevel = studentFeedback.englishLevel;
  }

  id: number;

  createdDate: string;

  updatedDate: string;

  content: StudentFeedbackContentDto;

  recommendation: Recommendation;

  author: PersonDto;

  mentor?: PersonDto;

  englishLevel: LanguageLevel;
}
