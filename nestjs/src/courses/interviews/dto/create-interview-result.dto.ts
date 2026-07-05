import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InterviewFormAnswerDto {
  @ApiProperty()
  questionId: string;

  @ApiProperty()
  questionText: string;

  @ApiProperty()
  answer: string;
}

export class CreateInterviewResultDto {
  @ApiProperty({ oneOf: [{ type: 'number' }, { type: 'string' }] })
  @IsNotEmpty()
  score: number | string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ type: [InterviewFormAnswerDto] })
  @IsOptional()
  @IsArray()
  formAnswers?: InterviewFormAnswerDto[];
}
