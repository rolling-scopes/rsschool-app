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
    this.eventId = courseEvent.eventId;
    this.name = courseEvent.event.name;
    this.type = courseEvent.event.type as EventType;
    this.description = courseEvent.event.description;
    this.descriptionUrl = courseEvent.event.descriptionUrl;
    this.dateTime = courseEvent.dateTime ? new Date(courseEvent.dateTime).toISOString() : null;
    this.endTime = courseEvent.endTime ? new Date(courseEvent.endTime).toISOString() : null;
    this.place = courseEvent.place ?? null;
    this.comment = courseEvent.comment ?? null;
    this.special = courseEvent.special;
    this.disciplineId = courseEvent.event.disciplineId ?? null;
    this.organizer = courseEvent.organizer ? new PersonDto(courseEvent.organizer) : null;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  eventId: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: EventType })
  type: EventType;

  @ApiProperty()
  description: string;

  @ApiProperty()
  descriptionUrl: string;

  @ApiProperty({ nullable: true, type: String })
  dateTime: string | null;

  @ApiProperty({ nullable: true, type: String })
  endTime: string | null;

  @ApiProperty({ nullable: true, type: String })
  place: string | null;

  @ApiProperty({ nullable: true, type: String })
  comment: string | null;

  @ApiProperty()
  special: string;

  @ApiProperty({ nullable: true, type: Number })
  disciplineId: number | null;

  @ApiProperty({ nullable: true, type: PersonDto })
  organizer: PersonDto | null;
}
