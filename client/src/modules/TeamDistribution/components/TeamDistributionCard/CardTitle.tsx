import { Col, Row, Space, Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';

import { TeamDistributionDto } from 'api';
import { DistributionPeriod } from './DistributionPeriod';

type Props = {
  distribution: TeamDistributionDto;
};

const { Text, Title } = Typography;

export function CardTitle({ distribution }: Props) {
  return (
    <Row gutter={24} wrap justify="space-between">
      <Col>
        <Title level={5}>{distribution.name}</Title>
      </Col>
      <Col>
        <Space size="middle" wrap>
          {distribution.minTotalScore !== 0 && (
            <Text style={{ fontSize: 14 }} type="secondary">
              Min score {distribution.minTotalScore}
            </Text>
          )}
          <Text style={{ fontSize: 14 }} type="secondary">
            <TeamOutlined style={{ marginRight: 8 }} />
            {distribution.strictTeamSize} members
          </Text>
          <DistributionPeriod startDate={distribution.startDate} endDate={distribution.endDate} />
        </Space>
      </Col>
    </Row>
  );
}
