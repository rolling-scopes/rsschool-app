import { TeamDistribution } from '@entities/teamDistribution';
import { ApiProperty } from '@nestjs/swagger';

export class TeamDistributionDto {
  constructor(teamDistribution: TeamDistribution) {
    this.id = teamDistribution.id;
    this.name = teamDistribution.name;
    this.startDate = teamDistribution.startDate;
    this.endDate = teamDistribution.endDate;
    this.description = teamDistribution.description;
    this.minStudents = teamDistribution.minStudents;
    this.maxStudents = teamDistribution.maxStudents;
    this.studentsCount = teamDistribution.studentsCount;
    this.strictStudentsCount = teamDistribution.strictStudentsCount;
    this.minTotalScore = teamDistribution.minTotalScore;
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

  @ApiProperty()
  public minStudents: number;

  @ApiProperty()
  public maxStudents: number;

  @ApiProperty()
  public studentsCount: number;

  @ApiProperty()
  public strictStudentsCount: boolean;

  @ApiProperty()
  public minTotalScore: number;
}
