import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ExpelCriteriaDto {
  @ApiProperty({
    example: [123, 456, 789],
    description: 'Array of course task IDs',
    required: false,
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  courseTaskIds?: number[];

  @ApiProperty({
    example: 100,
    description: 'Minimum score threshold',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minScore?: number;
}

class ExpelOptionsDto {
  @ApiProperty({
    example: true,
    description: 'Whether to keep the student with their mentor',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  keepWithMentor?: boolean;

  @ApiProperty({
    example: true,
    description: 'Save assigning to the mentor (default: false)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  saveAssigningToMentor?: boolean;
}

export class ExpelStatusDto {
  @ApiProperty({
    type: ExpelCriteriaDto,
    description: 'Criteria for expelling students',
  })
  @ValidateNested()
  @Type(() => ExpelCriteriaDto)
  criteria: ExpelCriteriaDto;

  @ApiProperty({
    type: ExpelOptionsDto,
    description: 'Additional options for expelling',
  })
  @ValidateNested()
  @Type(() => ExpelOptionsDto)
  options: ExpelOptionsDto;

  @ApiProperty({
    example: 'Cheating',
    description: 'Reason for expelling the student',
  })
  @IsString()
  expellingReason: string;
}
