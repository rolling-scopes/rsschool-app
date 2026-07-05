import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMultipleScoresItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  studentGithubId: string;

  @ApiProperty({ oneOf: [{ type: 'number' }, { type: 'string' }] })
  @IsNotEmpty()
  score: number | string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  githubPrUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mentorGithubId?: string;
}

export class OperationResultDto {
  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, type: String })
  value?: string;
}
