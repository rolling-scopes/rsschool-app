import { Card } from 'antd';
import { TeamDistributionDto } from 'api';
import { DistributionPeriod } from './DistributionPeriod';

type Props = {
  distribution: TeamDistributionDto;
};

export default function TeamDistributionModal({ distribution }: Props) {
  return (
    <Card
      style={{ marginTop: 24 }}
      key={distribution.id}
      title={distribution.name}
      extra={<DistributionPeriod startDate={distribution.startDate} endDate={distribution.endDate} />}
    >
      {distribution.description}
    </Card>
  );
}
