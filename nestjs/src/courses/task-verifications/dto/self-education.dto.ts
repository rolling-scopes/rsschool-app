import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type SelfEducationAnswers = {
  index: number;
  value: number | number[];
}[];

export class SelfEducationQuestionDto {
  constructor(question: SelfEducationQuestionDto) {
    this.answers = question.answers;
    this.question = question.question;
    this.multiple = question.multiple;
    this.questionImage = question.questionImage;
    this.answersType = question.answersType;
  }

  @ApiProperty()
  answers: string[];

  @ApiProperty()
  question: string;

  @ApiProperty()
  multiple: boolean;

  @ApiPropertyOptional()
  questionImage?: string;

  @ApiPropertyOptional()
  answersType?: 'image';
}

export class SelfEducationQuestionSelectedAnswersDto extends SelfEducationQuestionDto {
  constructor(question: SelfEducationQuestionSelectedAnswersDto) {
    super(question);
    this.selectedAnswers = question.selectedAnswers;
  }

  @ApiProperty({ type: [Number] })
  selectedAnswers: number[];
}
