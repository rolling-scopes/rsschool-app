import { CourseEvent } from '@entities/courseEvent';
import { ApiProperty } from '@nestjs/swagger';
import { PersonDto } from 'src/core/dto';

export enum EventType {
  Online = 'lecture_online',
  Offline = 'lecture_offline',
  Mixed = 'lecture_mixed',
  SelfStudy = 'lecture_self_study',
  Warmup = 'warmup',
  Info = 'info',
  Workshop = 'workshop',
  Meetup = 'meetup',
  CrossCheckdeadline = 'cross_check_deadline',
  Webinar = 'webinar',
  Special = 'special',
}

export class CourseEventDto {
  constructor(courseEvent: CourseEvent) {
    this.id = courseEvent.id;
    this.name = courseEvent.event.name;
    this.type = courseEvent.event.type as EventType;
    this.description = courseEvent.event.description;
    this.descriptionUrl = courseEvent.event.descriptionUrl;
    this.dateTime = (courseEvent.dateTime as Date).toISOString();
    this.organizer = new PersonDto(courseEvent.organizer);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: EventType })
  type: EventType;

  @ApiProperty()
  description: string;

  @ApiProperty()
  descriptionUrl: string;

  @ApiProperty()
  dateTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  organizer: PersonDto;
}
