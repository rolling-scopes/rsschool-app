import { ApiProperty } from '@nestjs/swagger';

class VerificationTaskDto {
  @ApiProperty()
  name: string;
}

class VerificationCourseTaskDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ nullable: true, type: String })
  type: string | null;

  @ApiProperty({ type: VerificationTaskDto })
  task: VerificationTaskDto;
}

export class StudentTaskVerificationDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  studentId: number;

  @ApiProperty()
  courseTaskId: number;

  @ApiProperty({ type: VerificationCourseTaskDto })
  courseTask: VerificationCourseTaskDto;

  @ApiProperty({ nullable: true, type: String })
  details: string | null;

  @ApiProperty()
  status: string;

  @ApiProperty()
  score: number;

  @ApiProperty({ type: 'array', items: { type: 'object', additionalProperties: true } })
  metadata: unknown[];
}

/**
 * A student's task verifications grouped by course task, so the client can look them up by
 * `courseTaskId` directly instead of filtering the full flat list per task.
 */
export class CourseTaskVerificationsDto {
  @ApiProperty()
  courseTaskId: number;

  @ApiProperty({ type: [StudentTaskVerificationDto] })
  verifications: StudentTaskVerificationDto[];
}
