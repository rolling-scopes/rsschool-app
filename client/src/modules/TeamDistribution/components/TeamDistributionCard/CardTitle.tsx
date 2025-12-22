import { Col, Row, Space, Typography } from 'antd';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import { TeamDistributionDto, TeamDistributionDtoRegistrationStatusEnum } from '@client/api';
import { DistributionPeriod } from './DistributionPeriod';
import { RenderMinTotalScore, RenderRegistrationStatus } from './renderers';

type Props = {
  distribution: TeamDistributionDto;
};

const { Text, Title } = Typography;

export function CardTitle({ distribution }: Props) {
  const isRegistrationCompletedOrDistributed =
    distribution.registrationStatus === TeamDistributionDtoRegistrationStatusEnum.Completed ||
    distribution.registrationStatus === TeamDistributionDtoRegistrationStatusEnum.Distributed;

  return (
    <Row gutter={24} wrap justify="space-between">
      <Col>
        <Title level={5}>{distribution.name}</Title>
      </Col>
      <Col>
        <Space size="middle" wrap>
          {isRegistrationCompletedOrDistributed ? (
            <RenderRegistrationStatus status={distribution.registrationStatus} />
          ) : (
            <RenderMinTotalScore score={distribution.minTotalScore} />
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
