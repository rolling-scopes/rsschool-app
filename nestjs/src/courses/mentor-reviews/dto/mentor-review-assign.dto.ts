import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class MentorReviewAssignDto {
  @ApiProperty()
  @IsInt()
  courseTaskId: number;

  @ApiProperty()
  @IsInt()
  mentorId: number;

  @ApiProperty()
  @IsInt()
  studentId: number;
}
