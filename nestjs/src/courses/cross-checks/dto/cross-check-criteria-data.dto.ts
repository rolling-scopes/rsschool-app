import { CrossCheckCriteriaType } from '@entities/taskCriteria';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @ApiProperty({ enum: CrossCheckCriteriaType })
  @IsEnum(CrossCheckCriteriaType)
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
