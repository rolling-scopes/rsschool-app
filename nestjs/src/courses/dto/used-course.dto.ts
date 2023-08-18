import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UsedCourseDto {
  constructor(course: { name: string; isActive: boolean }) {
    this.isActive = course.isActive;
    this.name = course.name;
  }

  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty()
  isActive: boolean;
}
