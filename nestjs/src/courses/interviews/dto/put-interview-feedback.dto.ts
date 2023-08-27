import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PutInterviewFeedbackDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  version: number;

  @ApiProperty()
  @IsNotEmpty()
  json: Record<string, unknown>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  decision?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isGoodCandidate?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  isCompleted: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  score: number;
}
