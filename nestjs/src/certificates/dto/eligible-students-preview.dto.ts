import { ApiProperty } from '@nestjs/swagger';
import { EligibleStudentDto } from './eligible-student.dto';

export class EligibleStudentsPreviewDto {
  @ApiProperty()
  public count: number;

  @ApiProperty({ type: [EligibleStudentDto] })
  public students: EligibleStudentDto[];

  constructor(students: EligibleStudentDto[]) {
    this.students = students;
    this.count = students.length;
  }
}
