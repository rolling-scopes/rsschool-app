import { TeamDistribution } from '@entities/teamDistribution';
import { ApiProperty } from '@nestjs/swagger';

export class TeamDistributionDto {
  constructor(teamDistribution: TeamDistribution) {
    this.id = teamDistribution.id;
    this.name = teamDistribution.name;
    this.startDate = teamDistribution.startDate;
    this.endDate = teamDistribution.endDate;
    this.description = teamDistribution.description;
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public startDate: Date;

  @ApiProperty()
  public endDate: Date;

  @ApiProperty()
  public description: string;
}
