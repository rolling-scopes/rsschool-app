import { TeamDistributionDtoRegistrationStatusEnum } from 'api';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import { Tag, Typography } from 'antd';

const { Text } = Typography;

type RegistrationStatusProps = {
  status: TeamDistributionDtoRegistrationStatusEnum;
};

export const RenderRegistrationStatus = ({ status }: RegistrationStatusProps) => {
  switch (status) {
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
type MinScoreProps = {
  score: number;
};

export const RenderMinTotalScore = ({ score }: MinScoreProps) => {
  if (!score) return null;
  return (
    <Text style={{ fontSize: 14 }} type="secondary">
      Min score {score}
    </Text>
  );
};
