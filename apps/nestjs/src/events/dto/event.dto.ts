import { Event } from '@entities/event';
import { ApiProperty } from '@nestjs/swagger';
import { IdNameDto } from 'src/core/dto';
import { EventType } from 'src/courses/course-events/dto/course-event.dto';

export class EventDto {
  constructor(event: Event) {
    this.id = event.id;
    this.name = event.name;
    this.descriptionUrl = event.descriptionUrl;
    this.description = event.description;
    this.type = event.type as EventType;
    this.discipline = event.discipline ? new IdNameDto(event.discipline) : null;
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public name: string;

  @ApiProperty({ nullable: true, type: String })
  public descriptionUrl: string | null;

  @ApiProperty({ nullable: true, type: String })
  public description: string | null;

  @ApiProperty({ enum: EventType })
  public type: EventType;

  @ApiProperty({ type: IdNameDto, nullable: true })
  public discipline: IdNameDto | null;
}
