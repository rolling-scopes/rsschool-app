import { ApiProperty } from '@nestjs/swagger';
import { HeroesRadarBadge, HeroesRadarBadgeDto } from './heroes-radar-badge.dto';

export interface HeroRadar {
  githubId: string;
  firstName: string;
  lastName: string;
  total: number;
  badges: HeroesRadarBadge[];
}

export class HeroRadarDto {
  constructor(hero: HeroRadar) {
    this.githubId = hero.githubId;
    this.firstName = hero.firstName;
    this.lastName = hero.lastName;
    this.total = hero.total;
    this.badges = hero.badges.map(badge => new HeroesRadarBadgeDto(badge));
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
