import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { TaskVerification, SelfEducationQuestionWithSelectedAnswers } from '@entities/taskVerification';

export class TaskVerificationAttemptDto {
  constructor(taskVerification: TaskVerification, questions: SelfEducationQuestionWithSelectedAnswers[]) {
    this.createdDate = taskVerification.createdDate;
    this.courseTaskId = taskVerification.courseTaskId;
    this.score = taskVerification.score;
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

  @ApiProperty({ type: Array<Record<string, unknown>> })
  @IsNotEmpty()
  questions: SelfEducationQuestionWithSelectedAnswers[];
}
