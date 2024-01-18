import { Course } from '@entities/course';
import { Feedback } from '@entities/feedback';
import { Mentor } from '@entities/mentor';
import { User } from '@entities/user';
import { ApiProperty } from '@nestjs/swagger';
import { CourseDto } from 'src/courses/dto';

type Data = {
  user: User;
  courses: Course[];
  mentors: Mentor[];
  studentsCount: number;
  interviewsCount: number;
  feedbacks: Feedback[];
};

class EndorsementUserDto {
  constructor(user: User) {
    this.id = user.id;
    this.githubId = user.githubId;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
  }
  @ApiProperty({ type: Number })
  public readonly id: number;

  @ApiProperty({ type: String })
  public readonly githubId: string;

  @ApiProperty({ type: String })
  public readonly firstName: string;

  @ApiProperty({ type: String })
  public readonly lastName: string;
}

class FeedbackDto {
  constructor(feedback: Feedback) {
    this.id = feedback.id;
    this.comment = feedback.comment;
  }

  @ApiProperty({ type: Number })
  public readonly id: number;

  @ApiProperty({ type: String })
  public readonly comment: string | null;
}

export class EndorsementDto {
  constructor(profile: { content: string; data: object } | null) {
    this.summary = profile?.content ?? 'We do not have enough data to generate endorsement.';
    this.data = profile?.data ?? null;
  }

  @ApiProperty({ type: String })
  public summary: string;

  @ApiProperty({ type: Object, nullable: true })
  public data: object | null;
}

export class EndorsementDataDto {
  constructor(data: Data) {
    this.user = data.user;
    this.courses = data.courses.map(course => new CourseDto(course));
    this.studentsCount = data.studentsCount;
    this.interviewsCount = data.interviewsCount;
    this.feedbacks = data.feedbacks;
  }

  @ApiProperty({ type: EndorsementUserDto })
  public user: User;

  @ApiProperty({ type: CourseDto, isArray: true, description: `User's courses` })
  public courses: CourseDto[];

  @ApiProperty({ type: Number, description: `Number of students` })
  public studentsCount: number;

  @ApiProperty({ type: Number, description: `Number of interviews` })
  public interviewsCount: number;

  public feedbacks: FeedbackDto[];
}
