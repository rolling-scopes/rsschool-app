import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { PersonDto } from 'src/core/dto';
import { CourseScheduleItem, CourseScheduleItemStatus } from '../course-schedule.service';

@ApiResponse({})
export class CourseScheduleItemDto {
  constructor(item: CourseScheduleItem) {
    this.name = item.name;
    this.startDate = (item.startDate as Date)?.toISOString();
    this.endDate = (item.endDate as Date)?.toISOString();
    this.maxScore = item.maxScore ?? null;
    this.scoreWeight = item.scoreWeight ?? null;
    this.organizer = item.organizer ?? null;
    this.status = item.status;
    this.score = item.score ?? null;
    this.tags = item.tags ?? [];
    this.descriptionUrl = item.descriptionUrl ?? null;
  }

  @ApiProperty()
  score: number | null;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: CourseScheduleItemStatus })
  status: CourseScheduleItemStatus;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty({ nullable: true })
  organizer: PersonDto | null;

  @ApiProperty({ nullable: true })
  maxScore: number | null;

  @ApiProperty({ nullable: true })
  scoreWeight: number | null;

  @ApiProperty({ nullable: true, type: String })
  descriptionUrl: string | null;

  @ApiProperty()
  tags: string[];
}
