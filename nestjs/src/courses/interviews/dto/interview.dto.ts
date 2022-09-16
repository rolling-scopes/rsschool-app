import { CourseTask } from '@entities/courseTask';
import { TaskType } from '@entities/task';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@ApiResponse({})
export class InterviewDto {
  constructor(courseTask: CourseTask) {
    this.id = courseTask.id;
    this.type = courseTask.type;
    this.name = courseTask.task.name;
    this.startDate = courseTask.studentStartDate;
    this.attributes = courseTask.task?.attributes;
  }

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  type: TaskType;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty()
  startDate: string | null | Date;

  @ApiProperty({ type: Object })
  attributes: Record<string, string>;
}
