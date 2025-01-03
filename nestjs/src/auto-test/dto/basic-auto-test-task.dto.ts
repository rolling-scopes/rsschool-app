import { Task } from '@entities/task';
import { ApiProperty } from '@nestjs/swagger';

export class BasicAutoTestTaskDto {
  constructor(task: Task) {
    this.id = task.id;
    this.name = task.name;
    this.maxAttemptsNumber = isNaN(task?.attributes?.public?.maxAttemptsNumber)
      ? null
      : Number(task?.attributes?.public?.maxAttemptsNumber);
    this.numberOfQuestions = isNaN(task?.attributes?.public?.numberOfQuestions)
      ? null
      : Number(task?.attributes?.public?.numberOfQuestions);
    this.strictAttemptsMode = !!task?.attributes?.public?.strictAttemptsMode;
    this.thresholdPercentage = isNaN(task?.attributes?.public?.tresholdPercentage)
      ? null
      : Number(task?.attributes?.public?.tresholdPercentage);
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public name: string;

  @ApiProperty({ nullable: true, type: Number })
  public maxAttemptsNumber: number | null;

  @ApiProperty({ nullable: true, type: Number })
  public numberOfQuestions: number | null;

  @ApiProperty({ nullable: true, type: Number })
  public strictAttemptsMode: boolean | null;

  @ApiProperty({ nullable: true, type: Number })
  public thresholdPercentage: number | null;
}
