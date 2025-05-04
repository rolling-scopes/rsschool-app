import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { TaskVerification } from '@entities/taskVerification';
import { SelfEducationQuestionSelectedAnswersDto } from './self-education.dto';

@ApiResponse({})
export class TaskVerificationAttemptDto {
  constructor(taskVerification: TaskVerification, questions: SelfEducationQuestionSelectedAnswersDto[]) {
    this.createdDate = taskVerification.createdDate.getTime();
    this.courseTaskId = taskVerification.courseTaskId;
    this.score = taskVerification.score;
    this.maxScore = taskVerification.courseTask.maxScore;
    this.questions = questions;
  }

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  createdDate: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  courseTaskId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  score: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  maxScore: number;

  @ApiProperty({ type: [SelfEducationQuestionSelectedAnswersDto] })
  @IsNotEmpty()
  questions: SelfEducationQuestionSelectedAnswersDto[];
}
