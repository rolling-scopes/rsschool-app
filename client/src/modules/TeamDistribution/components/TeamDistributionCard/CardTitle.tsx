import { Col, Row, Space, Tag, Typography } from 'antd';
import { TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { TeamDistributionDto, TeamDistributionDtoRegistrationStatusEnum } from 'api';
import { DistributionPeriod } from './DistributionPeriod';

type Props = {
  distribution: TeamDistributionDto;
};

const { Text, Title } = Typography;

export function CardTitle({ distribution }: Props) {
  const renderTag = () => {
    switch (distribution.registrationStatus) {
      case TeamDistributionDtoRegistrationStatusEnum.Distributed:
        return (
          <Tag icon={<ClockCircleOutlined />} color="green">
            distributed
          </Tag>
        );
      case TeamDistributionDtoRegistrationStatusEnum.Completed:
        return <Tag icon={<ClockCircleOutlined />}>without team</Tag>;
      default:
        return null;
    }
  };

  return (
    <Row gutter={24} wrap justify="space-between">
      <Col>
        <Title level={5}>{distribution.name}</Title>
      </Col>
      <Col>
        <Space size="middle" wrap>
          {distribution.registrationStatus === TeamDistributionDtoRegistrationStatusEnum.Completed ||
          distribution.registrationStatus === TeamDistributionDtoRegistrationStatusEnum.Distributed
            ? renderTag()
            : distribution.minTotalScore !== 0 && (
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
