import { Student } from '@entities/student';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { StudentDto } from '../../students/dto';

@ApiResponse({})
export class MentorStudentDto extends StudentDto {
  constructor(student: Student) {
    super(student);
    this.hasFeedback = student.feedbacks.length > 0;
  }

  @ApiProperty()
  hasFeedback: boolean;
}
