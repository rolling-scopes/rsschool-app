import { Team } from '@entities/team';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinTeamDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public password: string;
}

export class JoinTeamDtoRes {
  constructor(team: Team) {
    this.name = team.name;
  }

  @ApiProperty()
  public name: string;
}
