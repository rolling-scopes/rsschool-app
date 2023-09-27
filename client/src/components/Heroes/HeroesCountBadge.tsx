import { Badge, Tooltip, Avatar } from 'antd';
import { HeroesRadarBadgeDto } from 'api';
import heroesBadges from 'configs/heroes-badges';

function HeroesCountBadge({ badge: { id, count } }: { badge: HeroesRadarBadgeDto }) {
  return (
    <div style={{ margin: 5, display: 'inline-block' }}>
      <Badge count={count}>
        <Tooltip title={heroesBadges[id].name}>
          <Avatar src={`/static/svg/badges/${heroesBadges[id].url}`} alt={`${id} badge`} size={48} />
        </Tooltip>
      </Badge>
    </div>
  );
}

export default HeroesCountBadge;
