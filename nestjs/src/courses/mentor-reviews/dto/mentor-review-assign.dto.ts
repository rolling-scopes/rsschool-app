import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class MentorReviewAssignDto {
  @ApiProperty()
  @IsInt()
  courseTaskId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  mentorId?: number;

  @ApiProperty()
  @IsInt()
  studentId: number;
}
