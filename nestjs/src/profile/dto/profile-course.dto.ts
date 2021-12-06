import { Course } from '@entities/course';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileCourseDto {
  constructor(course: Course) {
    this.id = course.id;
    this.name = course.name;
    this.alias = course.alias;
  }

  @ApiProperty()
  public id: number;
  @ApiProperty()
  public name: string;
  @ApiProperty()
  public alias: string;
}
