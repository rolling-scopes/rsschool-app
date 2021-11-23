import { IsNotEmpty, IsNumber, IsString, IsEnum, IsNotEmptyObject } from 'class-validator';
import { Recommendation, StudentFeedbackContent } from '@entities/studentFeedback';

export class StudentFeedbackContentDto implements StudentFeedbackContent {
  @IsNotEmpty()
  @IsString()
  impression: string;

  @IsNotEmpty()
  @IsString()
  gaps: string;

  @IsNotEmpty()
  @IsString()
  recommendationComment: string;
}

export class CreateStudentFeedbackDto {
  @IsNotEmptyObject()
  content: StudentFeedbackContentDto;

  @IsNotEmpty()
  @IsNumber()
  mentorId: number;

  @IsEnum(Recommendation)
  @IsNotEmpty()
  recommendation: Recommendation;
}
