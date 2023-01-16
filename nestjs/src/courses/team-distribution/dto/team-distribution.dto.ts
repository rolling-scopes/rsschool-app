import { TeamDistribution } from '@entities/teamDistribution';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { registrationStatusEnum } from '../team-distribution.service';
import { TeamDto } from './team.dto';

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

@ApiResponse({})
export class TeamDistributionDetailedDto {
  constructor(distribution: TeamDistribution, team?: TeamDto) {
    this.studentsWithoutTeamCount = distribution.studentsWithoutTeam.length;
    this.teamsCount = distribution.teams.length;
    this.id = distribution.id;
    this.name = distribution.name;
    this.myTeam = team;
    this.minStudents = distribution.minStudents;
    this.maxStudents = distribution.maxStudents;
    this.studentsCount = distribution.studentsCount;
    this.strictStudentsCount = distribution.strictStudentsCount;
    this.courseId = distribution.courseId;
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public courseId: number;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public studentsWithoutTeamCount: number;

  @ApiProperty()
  public teamsCount: number;

  @ApiProperty()
  @IsOptional()
  public myTeam?: TeamDto;

  @ApiProperty()
  public minStudents: number;

  @ApiProperty()
  public maxStudents: number;

  @ApiProperty()
  public studentsCount: number;

  @ApiProperty()
  public strictStudentsCount: boolean;
}
