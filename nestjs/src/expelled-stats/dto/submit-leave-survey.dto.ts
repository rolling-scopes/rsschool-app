import { IsArray, IsOptional, IsString } from 'class-validator';

export class SubmitLeaveSurveyDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  reasonForLeaving?: string[];

  @IsOptional()
  @IsString()
  otherComment?: string;
}
