import { ApiProperty } from '@nestjs/swagger';
import { HeroesRadarBadge, HeroesRadarBadgeDto } from './heroes-radar-badge.dto';

export class HeroesRadarDto {
  constructor(heroes: {
    githubId: string;
    firstName: string;
    lastName: string;
    total: number;
    badges: HeroesRadarBadge[];
  }) {
    this.githubId = heroes.githubId;
    this.firstName = heroes.firstName;
    this.lastName = heroes.lastName;
    this.total = heroes.total;
    this.badges = heroes.badges.map(badge => new HeroesRadarBadgeDto(badge));
  }

  @ApiProperty()
  public githubId: string;

  @ApiProperty()
  public firstName: string;

  @ApiProperty()
  public lastName: string;

  @ApiProperty()
  public total: number;

  @ApiProperty({ type: [HeroesRadarBadgeDto] })
  badges: HeroesRadarBadgeDto[];
}
