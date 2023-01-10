import { TeamDistribution } from '@entities/teamDistribution';
import { ApiProperty } from '@nestjs/swagger';
import { registrationStatusEnum } from '../team-distribution.service';
import { TeamDistributionStudentDto } from './team-distribution-student.dto';

export class TeamDistributionDto {
  constructor(teamDistribution: TeamDistribution & { registrationStatus?: string }) {
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
    this.descriptionUrl = teamDistribution.descriptionUrl;
    this.registrationStatus = teamDistribution.registrationStatus ?? null;
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public name: string;

  @ApiProperty({ enum: registrationStatusEnum })
  registrationStatus: string | null;

  @ApiProperty()
  public startDate: Date;

  @ApiProperty()
  public endDate: Date;

  @ApiProperty()
  public description: string;

  @ApiProperty()
  public descriptionUrl: string;

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

export class TeamDistributionDetailedDto {
  constructor(teamDistribution: TeamDistribution) {
    this.studentWithoutTeam = teamDistribution.studentsWithoutTeam.map(
      student => new TeamDistributionStudentDto(student),
    );
  }

  @ApiProperty()
  public studentWithoutTeam: TeamDistributionStudentDto[];
}
