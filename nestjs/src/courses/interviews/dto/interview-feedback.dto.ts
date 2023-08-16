import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class InterviewFeedbackDto {
  constructor(data: { version: number; json: Record<string, unknown>; isCompleted: boolean }) {
    this.version = data.version;
    this.json = data.json;

    this.isCompleted = data.isCompleted ?? false;
  }

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  version: number;

  @ApiProperty()
  @IsNotEmpty()
  json: Record<string, unknown>;

  @ApiProperty()
  @IsNotEmpty()
  isCompleted: boolean;
}
