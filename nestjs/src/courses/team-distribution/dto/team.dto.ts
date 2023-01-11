import { Team } from '@entities/team';
import { ApiProperty } from '@nestjs/swagger';
import { TeamDistributionStudentDto } from './team-distribution-student.dto';

export class TeamDto {
  constructor(team: Team) {
    this.id = team.id;
    this.name = team.name;
    this.chatLink = team.chatLink;
    this.description = team.description;
    this.students = team.students.map(st => new TeamDistributionStudentDto(st));
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public chatLink: string;

  @ApiProperty()
  public description: string;

  @ApiProperty()
  public students: TeamDistributionStudentDto[];
}
