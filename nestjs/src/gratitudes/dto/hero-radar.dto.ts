import { ApiProperty } from '@nestjs/swagger';
import { HeroesRadarBadge, HeroesRadarBadgeDto } from './heroes-radar-badge.dto';
import { PersonDto } from 'src/core/dto';

export interface HeroRadar {
  githubId: string;
  firstName: string;
  lastName: string;
  rank: number;
  total: number;
  badges: HeroesRadarBadge[];
}

export class HeroRadarDto {
  constructor(hero: HeroRadar) {
    this.githubId = hero.githubId;
    this.name = PersonDto.getName(hero);
    this.rank = hero.rank;
    this.total = hero.total;
    this.badges = hero.badges.map(badge => new HeroesRadarBadgeDto(badge));
  }

  @ApiProperty()
  public githubId: string;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public rank: number;

  @ApiProperty()
  public total: number;

  @ApiProperty({ type: [HeroesRadarBadgeDto] })
  badges: HeroesRadarBadgeDto[];
}
