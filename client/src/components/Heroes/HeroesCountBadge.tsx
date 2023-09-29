import { Badge, Tooltip, Avatar } from 'antd';
import { HeroesRadarBadgeDto } from 'api';
import { dateTimeRenderer } from 'components/Table';
import heroesBadges from 'configs/heroes-badges';

type HeroesCountBadgeProps = {
  badge: Omit<HeroesRadarBadgeDto, 'id' | 'comment' | 'date'> &
    Partial<Pick<HeroesRadarBadgeDto, 'comment' | 'date'> & { count: number }>;
};

function HeroesCountBadge({ badge: { badgeId, count = 0, comment, date } }: HeroesCountBadgeProps) {
  return (
    <div style={{ margin: 5, display: 'inline-block' }}>
      <Badge count={count}>
        <Tooltip
          title={
            <>
              {heroesBadges[badgeId].name}
              {comment && date && (
                <>
                  <br />
                  {comment}
                  <br />
                  {dateTimeRenderer(date)}
                </>
              )}
            </>
          }
        >
          <Avatar src={`/static/svg/badges/${heroesBadges[badgeId].url}`} alt={`${badgeId} badge`} size={48} />
        </Tooltip>
      </Badge>
    </div>
  );
}

export default HeroesCountBadge;
