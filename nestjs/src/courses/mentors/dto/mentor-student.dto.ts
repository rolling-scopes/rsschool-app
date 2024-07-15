import { Student } from '@entities/student';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { StudentDto } from '../../students/dto';
import { StudentFeedbackDto } from '../../students/feedbacks/dto';

@ApiResponse({})
export class MentorStudentDto extends StudentDto {
  constructor(student: Student) {
    super(student);
    this.feedbacks = student.feedbacks?.map(feedback => new StudentFeedbackDto(feedback)) ?? [];
    this.repoUrl = student.repository ? student.repository : null;
  }

  @ApiProperty({ type: [StudentFeedbackDto] })
  @IsArray()
  feedbacks: StudentFeedbackDto[];

  @ApiProperty({ nullable: true, type: String })
  @IsString()
  repoUrl: string | null;
}
