import { CourseLeaveSurveyResponse } from '@entities/index';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
    this.reasonForLeaving = data.reasonForLeaving;
    this.otherComment = data.otherComment ?? '';
    this.submittedAt = data.submittedAt.toISOString();
  }

  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => CourseDto })
  course: CourseDto;

  @ApiProperty({ type: () => UserDto })
  user: UserDto;

  @ApiPropertyOptional({ type: [String] })
  reasonForLeaving?: string[];

  @ApiProperty()
  otherComment: string;

  @ApiProperty({ format: 'date-time' })
  submittedAt: string;
}
