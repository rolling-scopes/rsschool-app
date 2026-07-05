import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSingleScoreDto {
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
}
