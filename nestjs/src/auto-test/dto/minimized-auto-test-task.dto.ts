import { Task } from '@entities/task';
import { ApiProperty } from '@nestjs/swagger';

export class MinimizedAutoTestTaskDto {
  constructor(task: Task) {
    this.id = task.id;
    this.name = task.name;
    this.maxAttemptsNumber = Number(task?.attributes?.public?.maxAttemptsNumber);
    this.numberOfQuestions = Number(task?.attributes?.public?.numberOfQuestions);
    this.strictAttemptsMode = !!task?.attributes?.public?.strictAttemptsMode;
    this.thresholdPercentage = Number(task?.attributes?.public?.tresholdPercentage);
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public maxAttemptsNumber: number;

  @ApiProperty()
  public numberOfQuestions: number;

  @ApiProperty()
  public strictAttemptsMode: boolean;

  @ApiProperty()
  public thresholdPercentage: number;
}
