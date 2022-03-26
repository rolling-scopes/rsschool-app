import { Feedback } from '@entities/feedback';
import { ApiProperty } from '@nestjs/swagger';
import { PersonDto } from 'src/core/dto';
import { Badge } from './badge.dto';

export class GratitudeDto {
  constructor(feedback: Feedback) {
    this.id = feedback.id;
    this.user = new PersonDto(feedback.toUser);
    this.comment = feedback.comment ?? '';
    this.badgeId = feedback.badgeId as Badge;
    this.courseId = feedback.courseId;
  }

  @ApiProperty()
  public user: PersonDto;

  @ApiProperty()
  public id: number;

  @ApiProperty({ type: Badge, enum: Badge })
  public badgeId: Badge;

  @ApiProperty()
  public comment: string;

  @ApiProperty()
  public courseId: number;
}
