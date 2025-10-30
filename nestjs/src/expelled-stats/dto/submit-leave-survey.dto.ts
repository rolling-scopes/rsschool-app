import { IsArray, IsOptional, IsString } from 'class-validator';

export class SubmitLeaveSurveyDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  reasonForLeaving?: string[];

  @IsString()
  @IsOptional()
  otherComment?: string;
}
