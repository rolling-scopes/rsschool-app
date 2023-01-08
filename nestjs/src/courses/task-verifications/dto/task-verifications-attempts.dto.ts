import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { TaskVerification } from '@entities/taskVerification';

export class SelfEducationQuestionWithAnswers {
  answers: string[];
  selectedAnswers: (number | number[])[];
  question: string;
  multiple: boolean;
  questionImage?: string | undefined;
  answersType?: 'image' | undefined;
}

export class TaskVerificationAttemptDto {
  constructor(taskVerification: TaskVerification, questions: SelfEducationQuestionWithAnswers[]) {
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

  @ApiProperty({ type: [SelfEducationQuestionWithAnswers] })
  @IsNotEmpty()
  questions: SelfEducationQuestionWithAnswers[];
}
