import { IsNotEmpty, IsString, IsEnum, IsNotEmptyObject } from 'class-validator';
import { Recommendation, StudentFeedbackContent } from '@entities/student-feedback';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { LanguageLevel } from 'src/data';

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
}

@ApiResponse({})
export class CreateStudentFeedbackDto {
  @IsNotEmptyObject()
  content: StudentFeedbackContentDto;

  @IsEnum(Recommendation)
  @IsNotEmpty()
  recommendation: Recommendation;

  @IsEnum(LanguageLevel)
  @IsNotEmpty()
  englishLevel: LanguageLevel;
}
