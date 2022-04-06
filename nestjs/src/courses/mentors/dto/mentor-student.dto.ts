import { Student } from '@entities/student';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { StudentDto } from '../../students/dto';

class StudentFeedback {
  @ApiProperty()
  id: number;
}
@ApiResponse({})
export class MentorStudentDto extends StudentDto {
  constructor(student: Student) {
    super(student);
    this.feedbacks = student.feedbacks?.filter(f => f.mentorId === student.mentorId).map(f => ({ id: f.id })) ?? [];
  }

  @ApiProperty({ type: [StudentFeedback] })
  feedbacks: { id: number }[];
}
