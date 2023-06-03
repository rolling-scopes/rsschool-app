import { Recommendation } from '@entities/student-feedback';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsEnum, IsNotEmptyObject, IsOptional } from 'class-validator';
import { LanguageLevel } from '@entities/data';
import { StudentFeedbackContentDto } from './create-student-feedback.dto';

@ApiResponse({})
export class UpdateStudentFeedbackDto {
  @IsNotEmptyObject()
  @IsOptional()
  @ApiProperty({ type: StudentFeedbackContentDto })
  content: StudentFeedbackContentDto;

  @IsEnum(Recommendation)
  @IsOptional()
  @ApiProperty({ enum: Recommendation })
  recommendation: Recommendation;

  @IsEnum(LanguageLevel)
  @IsOptional()
  @ApiProperty({ enum: LanguageLevel })
  englishLevel: LanguageLevel;
}
