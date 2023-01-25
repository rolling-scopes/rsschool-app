import { ApiProperty } from '@nestjs/swagger';
import { AvailableCrossCheckStats } from '../course-cross-checks.service';

export class AvailableReviewStatsDto {
  constructor(stats: AvailableCrossCheckStats) {
    this.name = stats.name;
    this.id = stats.id;
    this.checksCount = stats.checksCount ?? 0;
    this.completedChecksCount = stats.completedChecksCount ?? 0;
  }

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public checksCount: number;

  @ApiProperty()
  public completedChecksCount: number;
}
