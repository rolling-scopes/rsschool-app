import { Rate, Recommendation, SoftSkill, StudentFeedbackContent } from '@entities/student-feedback';
import { LanguageLevel } from '@entities/data';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

class SoftSkillEntry {
  @ApiProperty({ enum: SoftSkill })
  @IsEnum(SoftSkill)
  @IsNotEmpty()
  id: SoftSkill;

  @ApiProperty({ enum: Rate })
  @IsNotEmpty()
  value: Rate;
}

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

  @ApiProperty({ type: [SoftSkillEntry] })
  @IsArray()
  softSkills: SoftSkillEntry[];
}

export class CreateStudentFeedbackDto {
  @ValidateNested()
  @IsObject()
  @Type(() => StudentFeedbackContentDto)
  @ApiProperty({ type: StudentFeedbackContentDto })
  content: StudentFeedbackContentDto;

  @IsEnum(Recommendation)
  @IsNotEmpty()
  @ApiProperty({ enum: Recommendation })
  recommendation: Recommendation;

  @IsEnum(LanguageLevel)
  @IsOptional()
  @ApiProperty({ enum: LanguageLevel })
  englishLevel: LanguageLevel;
}
