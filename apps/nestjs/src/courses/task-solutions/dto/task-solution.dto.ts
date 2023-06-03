import { TaskSolution } from '@entities/taskSolution';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TaskSolutionDto {
  constructor(taskSolution: TaskSolution) {
    this.id = taskSolution.id;
    this.url = taskSolution.url;
    this.courseTaskId = taskSolution.courseTaskId;
  }

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  courseTaskId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  url: string;
}
