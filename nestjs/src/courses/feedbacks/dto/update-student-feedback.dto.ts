import { Recommendation } from '@entities/student-feedback';
import { ApiResponse } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsNotEmptyObject, IsOptional } from 'class-validator';
import { LanguageLevel } from 'src/data';

import { StudentFeedbackContentDto } from './create-student-feedback.dto';

@ApiResponse({})
export class UpdateStudentFeedbackDto {
  @IsNotEmptyObject()
  @IsOptional()
  content: StudentFeedbackContentDto;

  @IsEnum(Recommendation)
  @IsOptional()
  recommendation: Recommendation;

  @IsEnum(LanguageLevel)
  @IsOptional()
  englishLevel: LanguageLevel;
}
