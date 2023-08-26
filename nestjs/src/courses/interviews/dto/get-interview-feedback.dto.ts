import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class InterviewFeedbackDto {
  constructor(data: {
    feedback: {
      json: Record<string, unknown>;
      version: number;
    } | null;
    isCompleted: boolean;
    maxScore: number;
  }) {
    this.version = data.feedback?.version;
    this.json = data.feedback?.json;
    this.maxScore = data.maxScore;
    this.isCompleted = data.isCompleted ?? false;
  }

  @IsNumber()
  @ApiProperty({ required: false })
  version?: number;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  json?: Record<string, unknown>;

  @ApiProperty()
  @IsNotEmpty()
  isCompleted: boolean;

  @ApiProperty()
  @IsNotEmpty()
  maxScore: number;
}
