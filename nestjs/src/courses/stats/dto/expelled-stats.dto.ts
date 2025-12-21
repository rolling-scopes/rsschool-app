import { IsArray, IsDateString, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseLeaveSurveyResponse } from 'src/entities/course-leave-survey-response.entity';
import { CourseDto } from 'src/courses/dto';
import { UserDto } from 'src/users/dto';
import { UsersService } from 'src/users/users.service';

export class ExpelledStatsDto {
  constructor(data: CourseLeaveSurveyResponse) {
    this.id = data.id;
    this.course = new CourseDto(data.course);
    this.user = new UserDto({
      id: data.user.id,
      githubId: data.user.githubId,
      name: UsersService.getFullName(data.user),
    });
  }

  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNumber()
  course: CourseDto;

  @ApiProperty()
  user: UserDto;

  @ApiProperty()
  @IsArray()
  reasonForLeaving: string[];

  @ApiProperty()
  @IsString()
  otherComment: string;

  @ApiProperty()
  @IsDateString()
  submittedAt: Date;
}
