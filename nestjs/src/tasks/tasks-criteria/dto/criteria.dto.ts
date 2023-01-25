import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CrossCheckCriteriaType } from '@entities/taskCriteria';

export class CriteriaDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  max?: number;

  @IsNotEmpty()
  @IsEnum(CrossCheckCriteriaType)
  @ApiProperty({ enum: CrossCheckCriteriaType })
  type: CrossCheckCriteriaType;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  text: string;

  @IsString()
  @ApiProperty()
  key: string;

  @IsNumber()
  @ApiProperty()
  index: number;
}
