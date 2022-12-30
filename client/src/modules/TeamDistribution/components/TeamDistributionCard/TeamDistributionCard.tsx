import { Button, Card } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { TeamDistributionDto } from 'api';
import { DistributionPeriod } from './DistributionPeriod';

type Props = {
  distribution: TeamDistributionDto;
  isManager: boolean;
  onDelete: (id: number) => Promise<void>;
  onEdit: (distribution: TeamDistributionDto) => void;
};

export default function TeamDistributionModal({ distribution, isManager, onDelete, onEdit }: Props) {
  return (
    <Card
      style={{ marginTop: 24 }}
      key={distribution.id}
      title={distribution.name}
      extra={<DistributionPeriod startDate={distribution.startDate} endDate={distribution.endDate} />}
      actions={
        isManager
          ? [
              <Button key="edit" icon={<EditOutlined />} onClick={() => onEdit(distribution)}>
                Edit Team Distribution
              </Button>,
              <Button key="delete" icon={<DeleteOutlined />} onClick={() => onDelete(distribution.id)}>
                Delete Team Distribution
              </Button>,
            ]
          : undefined
      }
    >
      {distribution.description}
    </Card>
  );
}
