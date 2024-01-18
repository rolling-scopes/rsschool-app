import { Course } from '@entities/course';
import { Feedback } from '@entities/feedback';
import { Mentor } from '@entities/mentor';
import { User } from '@entities/user';
import { ApiProperty } from '@nestjs/swagger';

type Data = {
  user: User;
  courses: Course[];
  mentors: Mentor[];
  studentsCount: number;
  interviewsCount: number;
  feedbacks: Feedback[];
};

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
    this.courses = data.courses;
    this.mentors = data.mentors;
    this.studentsCount = data.studentsCount;
    this.interviewsCount = data.interviewsCount;
    this.feedbacks = data.feedbacks;
  }

  public user: User;
  public courses: Course[];
  public mentors: Mentor[];
  public studentsCount: number;
  public interviewsCount: number;
  public feedbacks: Feedback[];
}
