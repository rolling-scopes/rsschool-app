import { ApiProperty } from '@nestjs/swagger';
import { Badge } from './badge.dto';

export interface HeroesRadarBadge {
  id: Badge;
  count: number;
}

export class HeroesRadarBadgeDto {
  constructor(badge: HeroesRadarBadge) {
    this.id = badge.id;
    this.count = badge.count;
  }

  @ApiProperty()
  public id: Badge;

  @ApiProperty()
  public count: number;
}
