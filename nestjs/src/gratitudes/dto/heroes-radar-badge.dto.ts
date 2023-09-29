import { ApiProperty } from '@nestjs/swagger';
import { Badge } from './badge.dto';

export interface HeroesRadarBadge {
  id: string;
  badgeId: Badge;
  comment: string;
  date: string;
}

export class HeroesRadarBadgeDto {
  constructor(badge: HeroesRadarBadge) {
    this.id = badge.id;
    this.badgeId = badge.badgeId;
    this.comment = badge.comment;
    this.date = new Date(badge.date).toISOString();
  }

  @ApiProperty()
  public id: string;

  @ApiProperty()
  public badgeId: Badge;

  @ApiProperty()
  public comment: string;

  @ApiProperty()
  public date: string;
}
