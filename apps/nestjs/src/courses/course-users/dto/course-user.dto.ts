import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ExtendedCourseUser } from '../types';

export class CourseUserDto {
  constructor(courseUser: ExtendedCourseUser) {
    this.id = courseUser.userId;
    this.courseId = courseUser.courseId;
    this.name = courseUser.name;
    this.githubId = courseUser.githubId;
    this.isManager = courseUser.isManager;
    this.isSupervisor = courseUser.isSupervisor;
    this.isJuryActivist = courseUser.isJuryActivist;
    this.isDementor = courseUser.isDementor;
  }

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  courseId: number;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  githubId: string;

  @IsBoolean()
  @ApiProperty()
  isManager: boolean;

  @IsBoolean()
  @ApiProperty()
  isSupervisor: boolean;

  @IsBoolean()
  @ApiProperty()
  isJuryActivist: boolean;

  @IsBoolean()
  @ApiProperty()
  isDementor: boolean;
}
