import { Rate, Recommendation, SoftSkill, StudentFeedbackContent } from '@entities/student-feedback';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional, IsString } from 'class-validator';
import { LanguageLevel } from '../../../data';

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

  @IsObject()
  @ApiProperty()
  softSkills: Record<SoftSkill, Rate>;
}

@ApiResponse({})
export class CreateStudentFeedbackDto {
  @IsNotEmptyObject()
  content: StudentFeedbackContentDto;

  @IsEnum(Recommendation)
  @IsNotEmpty()
  recommendation: Recommendation;

  @IsEnum(LanguageLevel)
  @IsOptional()
  englishLevel: LanguageLevel;
}
