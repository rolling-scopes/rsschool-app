import { Card, Col, Row, Typography } from 'antd';
import { HeroesRadarDto } from 'api';
import { getFullName } from 'utils/text-utils';
import HeroesCountBadge from './HeroesCountBadge';
import { GithubAvatar } from 'components/GithubAvatar';

const { Title } = Typography;

export interface HeroesRadarCardProps {
  hero: HeroesRadarDto;
}
function HeroesRadarCard({ hero: { githubId, firstName, lastName, total, badges } }: HeroesRadarCardProps) {
  return (
    <Card
      title={
        <Row>
          <GithubAvatar size={24} githubId={githubId} />
          <Title level={5} ellipsis={true}>
            {getFullName({ firstName, lastName, githubId })} - {total}
          </Title>
        </Row>
      }
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>
          {badges.map(badge => (
            <HeroesCountBadge badge={badge} />
          ))}
        </Col>
      </Row>
    </Card>
  );
}

export default HeroesRadarCard;
