import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class InterviewFeedbackDto {
  constructor(data: { version: number; json: unknown; isCompleted: boolean }) {
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
  json: unknown;

  @ApiProperty()
  @IsNotEmpty()
  isCompleted: boolean;
}
