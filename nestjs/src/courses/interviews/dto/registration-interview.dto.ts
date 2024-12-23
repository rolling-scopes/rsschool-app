import { TaskInterviewStudent } from '@entities/taskInterviewStudent';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationInterviewDto {
  constructor(taskInterviewStudent: TaskInterviewStudent) {
    this.id = taskInterviewStudent.id;
    this.registrationDate = taskInterviewStudent.createdDate;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  registrationDate: string;
}
