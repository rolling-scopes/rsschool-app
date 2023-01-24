import { Team } from '@entities/team';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from 'src/core/paginate';
import { PaginationMetaDto } from 'src/core/paginate/dto/Paginate.dto';
import { TeamDistributionStudentDto } from './team-distribution-student.dto';

export class TeamPasswordDto {
  constructor(team: Team) {
    this.password = `${team.id}_${team.password}`;
  }

  @ApiProperty()
  public password: string;
}

export class TeamDto {
  constructor(team: Team) {
    this.id = team.id;
    this.name = team.name;
    this.chatLink = team.chatLink;
    this.description = team.description;
    this.students = team.students.map(st => new TeamDistributionStudentDto(st));
    this.teamLeadId = team.teamLeadId;
    this.teamDistributionId = team.teamDistributionId;
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public chatLink: string;

  @ApiProperty()
  public description: string;

  @ApiProperty({ type: [TeamDistributionStudentDto] })
  public students: TeamDistributionStudentDto[];

  @ApiProperty()
  public teamLeadId: number;

  @ApiProperty()
  public teamDistributionId: number;
}

export class TeamsDto {
  constructor(teams: Team[], paginationMeta: PaginationMeta) {
    this.content = teams.map(t => new TeamDto(t));
    this.pagination = new PaginationMetaDto(paginationMeta);
  }

  @ApiProperty({ type: [TeamDto] })
  content: TeamDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}
