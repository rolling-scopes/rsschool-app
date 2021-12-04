import { Rate, Recommendation, SoftSkill, StudentFeedbackContent } from '@entities/student-feedback';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { LanguageLevel } from '../../../../data';

export class StudentFeedbackContentDto implements StudentFeedbackContent {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  impression: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  gaps: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  recommendationComment: string;

  @ApiProperty()
  @IsArray()
  softSkills: { id: SoftSkill; value: Rate }[];
}

@ApiResponse({})
export class CreateStudentFeedbackDto {
  @ValidateNested()
  @IsObject()
  @Type(() => StudentFeedbackContentDto)
  content: StudentFeedbackContentDto;

  @IsEnum(Recommendation)
  @IsNotEmpty()
  recommendation: Recommendation;

  @IsEnum(LanguageLevel)
  @IsOptional()
  englishLevel: LanguageLevel;
}
