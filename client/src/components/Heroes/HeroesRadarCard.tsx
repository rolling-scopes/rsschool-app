import { Card, Col, Divider, Row, Space, Typography } from 'antd';
import { HeroesRadarDto } from 'api';
import { getFullName } from 'utils/text-utils';
import HeroesCountBadge from './HeroesCountBadge';
import { GithubAvatar } from 'components/GithubAvatar';

const { Text, Title, Link } = Typography;

export interface HeroesRadarCardProps {
  hero: HeroesRadarDto;
}

function HeroesRadarCard({ hero: { githubId, firstName, lastName, total, badges } }: HeroesRadarCardProps) {
  return (
    <Card
      title={
        <Row>
          <GithubAvatar size={24} githubId={githubId} />
          <Title level={5} ellipsis={true} style={{ marginLeft: 6 }}>
            {getFullName({ firstName, lastName, githubId })} (<Link href={`/profile?githubId=${githubId}`}>@{githubId}</Link>)
          </Title>
        </Row>
      }
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>
          {badges.map(badge => (
            <HeroesCountBadge key={badge.badgeId} badge={badge} />
          ))}
        </Col>
      </Row>
      <Divider />
      <Row gutter={8}>
        <Col flex="auto">
          <Space>
            <Text type="secondary">Total badges:</Text>
            {total}
          </Space>
        </Col>
      </Row>
    </Card>
  );
}

export default HeroesRadarCard;
