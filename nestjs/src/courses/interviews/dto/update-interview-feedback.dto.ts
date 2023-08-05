import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateInterviewFeedbackDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  version: number;

  @ApiProperty()
  @IsNotEmpty()
  json: unknown;

  @ApiProperty()
  @IsOptional()
  @IsString()
  decision?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isGoodCandidate?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  isCompleted: boolean;
}
