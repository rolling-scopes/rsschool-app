import { ApiProperty } from '@nestjs/swagger';
import { Badge } from './badge.dto';

export interface HeroesRadarBadge {
  badgeId: Badge;
  badgeCount: number;
}

export class HeroesRadarBadgeDto {
  constructor(badge: HeroesRadarBadge) {
    this.badgeId = badge.badgeId;
    this.badgeCount = badge.badgeCount;
  }

  @ApiProperty()
  public badgeId: Badge;

  @ApiProperty()
  public badgeCount: number;
}
