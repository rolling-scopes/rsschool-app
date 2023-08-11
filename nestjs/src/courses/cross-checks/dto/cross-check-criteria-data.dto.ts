import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export type CrossCheckCriteriaType = 'title' | 'subtask' | 'penalty';

export class CrossCheckCriteriaDataDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  max?: number;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty({ enum: ['title', 'subtask', 'penalty'] })
  @IsIn(['title', 'subtask', 'penalty'])
  type: CrossCheckCriteriaType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  point?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  textComment?: string;
}
