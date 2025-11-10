import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class LeaveCourseRequestDto {
  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  reasonForLeaving?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  otherComment?: string;
}
