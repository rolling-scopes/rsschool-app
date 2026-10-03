import { ApiProperty } from '@nestjs/swagger';
import { EligibleStudentDto } from './eligible-student.dto';

export class BulkIssueResultDto {
  @ApiProperty()
  public issued: number;

  @ApiProperty({ type: [EligibleStudentDto] })
  public students: EligibleStudentDto[];

  constructor(students: EligibleStudentDto[]) {
    this.students = students;
    this.issued = students.length;
  }
}
