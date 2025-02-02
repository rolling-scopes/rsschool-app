import { StageInterviewStudent } from '@entities/stageInterviewStudent';
import { TaskInterviewStudent } from '@entities/taskInterviewStudent';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationInterviewDto {
  constructor(taskInterviewStudent: TaskInterviewStudent | StageInterviewStudent) {
    this.id = taskInterviewStudent.id;
    this.registrationDate = taskInterviewStudent.createdDate;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  registrationDate: string;
}
