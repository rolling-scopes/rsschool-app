import { ApiProperty } from '@nestjs/swagger';

export class CourseMentorsStatsDto {
  constructor(stats: { mentorsActiveCount: number; mentorsTotalCount: number; epamMentorsCount: number }) {
    this.mentorsActiveCount = stats.mentorsActiveCount;
    this.mentorsTotalCount = stats.mentorsTotalCount;
    this.epamMentorsCount = stats.epamMentorsCount;
  }

  @ApiProperty()
  mentorsActiveCount: number;

  @ApiProperty()
  mentorsTotalCount: number;

  @ApiProperty()
  epamMentorsCount: number;
}
