import { Badge, Tooltip, Avatar } from 'antd';
import { HeroesRadarBadgeDto } from 'api';
import heroesBadges from 'configs/heroes-badges';
import dayjs from 'dayjs';

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
                  {dayjs(date).format('YYYY-MM-DD HH:mm')}
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
