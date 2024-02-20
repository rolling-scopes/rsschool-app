import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { PersonDto } from 'src/core/dto';
import {
  CourseScheduleDataSource,
  CourseScheduleItem,
  CourseScheduleItemStatus,
  CourseScheduleItemTag,
} from '../course-schedule.service';

@ApiResponse({})
export class CourseScheduleItemDto {
  constructor(item: CourseScheduleItem) {
    this.id = item.id;
    this.taskId = item.taskId;
    this.eventId = item.eventId;
    this.name = item.name;
    this.startDate = (item.startDate as Date)?.toISOString();
    this.endDate = (item.endDate as Date)?.toISOString();
    this.maxScore = item.maxScore ?? null;
    this.scoreWeight = item.scoreWeight ?? null;
    this.organizer = item.organizer ?? null;
    this.status = item.status;
    this.score = item.score ?? null;
    this.tag = item.tag ?? null;
    this.descriptionUrl = item.descriptionUrl ?? null;
    this.type = item.type;
  }

  @ApiProperty({ type: Number, nullable: true })
  score: number | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  id: number;

  @ApiProperty({ nullable: true, type: Number })
  taskId: number | null;

  @ApiProperty({ nullable: true, type: Number })
  eventId: number | null;

  @ApiProperty({ enum: CourseScheduleItemStatus })
  status: CourseScheduleItemStatus;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty()
  crossCheckEndDate: string;

  @ApiProperty({ nullable: true, type: PersonDto })
  organizer: PersonDto | null;

  @ApiProperty({ nullable: true, type: Number })
  maxScore: number | null;

  @ApiProperty({ nullable: true, type: Number })
  scoreWeight: number | null;

  @ApiProperty({ nullable: true, type: String })
  descriptionUrl: string | null;

  @ApiProperty({ enum: CourseScheduleItemTag })
  tag: CourseScheduleItemTag;

  @ApiProperty({ enum: CourseScheduleDataSource })
  type: CourseScheduleDataSource;
}
