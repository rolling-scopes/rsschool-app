import { Recommendation, StudentFeedback } from '@entities/student-feedback';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { LanguageLevel } from '@entities/data';
import { PersonDto } from '../../../../core/dto';
import { StudentFeedbackContentDto } from './create-student-feedback.dto';

@ApiResponse({})
export class StudentFeedbackDto {
  constructor(studentFeedback: StudentFeedback) {
    this.content = studentFeedback.content;
    this.recommendation = studentFeedback.recommendation;
    this.author = new PersonDto(studentFeedback.author);
    this.mentor = studentFeedback.mentor
      ? new PersonDto({ id: studentFeedback.mentor.id, ...studentFeedback.mentor.user })
      : null;
    this.id = studentFeedback.id;
    this.createdDate = studentFeedback.createdDate;
    this.updatedDate = studentFeedback.updatedDate;
    this.englishLevel = studentFeedback.englishLevel;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdDate: string;

  @ApiProperty()
  updatedDate: string;

  @ApiProperty({ type: StudentFeedbackContentDto })
  content: StudentFeedbackContentDto;

  @ApiProperty({ enum: Recommendation })
  recommendation: Recommendation;

  @ApiProperty({ type: PersonDto })
  author: PersonDto;

  @ApiProperty({ type: PersonDto })
  mentor?: PersonDto;

  @ApiProperty({ enum: LanguageLevel })
  englishLevel: LanguageLevel;
}
