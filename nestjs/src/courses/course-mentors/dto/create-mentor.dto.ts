import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMentorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxStudentsLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferedStudentsLocation?: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  students: number[];
}
