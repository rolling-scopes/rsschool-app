import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { PersonDto } from 'src/core/dto';
import { CourseScheduleDataSource, CourseScheduleItem, CourseScheduleItemStatus } from '../course-schedule.service';

@ApiResponse({})
export class CourseScheduleItemDto {
  constructor(item: CourseScheduleItem) {
    this.name = item.name;
    this.studentStartDate = (item.studentStartDate as Date)?.toISOString();
    this.studentEndDate = (item.studentEndDate as Date)?.toISOString();
    this.maxScore = item.maxScore ?? null;
    this.scoreWeight = item.scoreWeight ?? null;
    this.organizer = item.organizer ?? null;
    this.status = item.status;
    this.dataSourceId = item.id;
    this.dataSource = item.dataSource;
    this.currentScore = item.currentScore ?? null;
    this.tags = item.tags ?? [];
    this.descriptionUrl = item.descriptionUrl ?? null;
  }

  @ApiProperty()
  dataSourceId: number;

  @ApiProperty()
  currentScore: number | null;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: CourseScheduleItemStatus })
  status: CourseScheduleItemStatus;

  @ApiProperty()
  studentStartDate: string;

  @ApiProperty()
  studentEndDate: string;

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

  @ApiProperty({ enum: CourseScheduleDataSource })
  dataSource: CourseScheduleDataSource;
}
