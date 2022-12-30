import { Card } from 'antd';
import { TeamDistributionDto } from 'api';

type Props = {
  distribution: TeamDistributionDto;
};

export default function TeamDistributionModal({ distribution }: Props) {
  return (
    <Card style={{ marginTop: 24 }} key={distribution.id} title={distribution.name}>
      {distribution.description}
    </Card>
  );
}
