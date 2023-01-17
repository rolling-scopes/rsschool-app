import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty()
  questionImage?: string;

  @ApiProperty()
  answersType?: 'image';
}

export class SelfEducationQuestionSelectedAnswersDto extends SelfEducationQuestionDto {
  constructor(question: SelfEducationQuestionSelectedAnswersDto) {
    super(question);
    this.selectedAnswers = question.selectedAnswers;
  }

  @ApiProperty({ type: [Number] })
  selectedAnswers: (number | number[])[];
}
