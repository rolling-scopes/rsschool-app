import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class ApproveMentorDto {
  @ApiProperty()
  @IsArray()
  preselectedCourses!: string[];
}
