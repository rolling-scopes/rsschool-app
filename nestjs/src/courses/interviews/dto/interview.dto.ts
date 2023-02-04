import { CourseTask } from '@entities/courseTask';
import { TaskType } from '@entities/task';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

class Attributes {
  @ApiProperty({ nullable: true })
  public template?: string;
}

@ApiResponse({})
export class InterviewDto {
  constructor(courseTask: CourseTask) {
    this.id = courseTask.id;
    this.type = courseTask.type;
    this.name = courseTask.task.name;
    this.startDate = courseTask.studentStartDate as string;
    this.endDate = courseTask.studentEndDate as string;
    this.description = courseTask.task.description;
    this.descriptionUrl = courseTask.task.descriptionUrl;
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
  startDate: string;

  @ApiProperty()
  endDate: string;

  @IsString()
  @ApiProperty({ nullable: true })
  description?: string;

  @IsString()
  @ApiProperty()
  descriptionUrl: string;

  @ApiProperty({ type: Attributes })
  attributes: Attributes;
}
