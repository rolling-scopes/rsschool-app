import { Badge, Tooltip, Avatar } from 'antd';
import { HeroesRadarBadgeDto } from 'api';
import heroesBadges from 'configs/heroes-badges';

function HeroesCountBadge({ badge: { badgeId, badgeCount } }: { badge: HeroesRadarBadgeDto }) {
  return (
    <div style={{ margin: 5, display: 'inline-block' }}>
      <Badge count={badgeCount}>
        <Tooltip title={(heroesBadges as any)[badgeId].name}>
          <Avatar src={`/static/svg/badges/${(heroesBadges as any)[badgeId].url}`} alt={`${badgeId} badge`} size={48} />
        </Tooltip>
      </Badge>
    </div>
  );
}

export default HeroesCountBadge;
