import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriteriaDto {
  @IsOptional()
  @IsNumber()
  @ApiProperty()
  max?: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  type: 'title' | 'subtask' | 'penalty';

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  text: string;
}
