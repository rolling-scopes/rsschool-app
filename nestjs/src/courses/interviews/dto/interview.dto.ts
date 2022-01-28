import { CourseTask } from '@entities/courseTask';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

@ApiResponse({})
export class InterviewDto {
  constructor(courseTask: CourseTask) {
    this.id = courseTask.id;
    this.attributes = courseTask.task?.attributes;
  }

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  id: number;

  @ApiProperty({ type: Object })
  attributes: Record<string, string>;
}
