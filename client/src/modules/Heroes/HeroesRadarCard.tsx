import { Card, Col, Row, Typography } from 'antd';
import { HeroesRadarDto } from 'api';
import { getFullName } from 'utils/text-utils';

const { Title } = Typography;

export interface HeroesRadarCardProps {
  hero: HeroesRadarDto;
}
function HeroesRadarCard({ hero: { githubId, firstName, lastName, total, badges } }: HeroesRadarCardProps) {

  return (
    <Card
      title={
        <Title level={5} ellipsis={true}>
          {getFullName({firstName, lastName, githubId})} - {total}
        </Title>
      }
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>
          {badges.map(({ badgeId, badgeCount }) => (
            <span>{badgeId} - {badgeCount}</span>
          ))}
        </Col>
      </Row>
    </Card>
  );
}

export default HeroesRadarCard;
