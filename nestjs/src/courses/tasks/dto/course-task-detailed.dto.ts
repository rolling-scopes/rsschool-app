import { CourseTask } from '@entities/courseTask';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { CourseTaskDto } from './course-task.dto';

@ApiResponse({})
export class CourseTaskDetailedDto extends CourseTaskDto {
  constructor(courseTask: CourseTask) {
    super(courseTask);
    this.publicAttributes = courseTask.task?.attributes?.['public'] ?? {};
  }

  @ApiProperty()
  publicAttributes: any;
}
