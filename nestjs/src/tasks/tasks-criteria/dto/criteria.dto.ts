import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriteriaDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  max?: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  type: 'title' | 'subtask' | 'penalty';

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
