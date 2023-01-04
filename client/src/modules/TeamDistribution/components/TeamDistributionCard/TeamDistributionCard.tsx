import { Button, Card } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { TeamDistributionDto } from 'api';
import { DistributionPeriod } from './DistributionPeriod';
import { Actions } from './Actions';
import { useMedia } from 'react-use';

type Props = {
  distribution: TeamDistributionDto;
  isManager: boolean;
  onDelete: (id: number) => Promise<void>;
  onEdit: (distribution: TeamDistributionDto) => void;
  onRegister: (distributionId: number) => Promise<void>;
  onDeleteRegister: (distributionId: number) => Promise<void>;
};

export default function TeamDistributionCard({
  distribution,
  isManager,
  onDelete,
  onEdit,
  onRegister,
  onDeleteRegister,
}: Props) {
  const mobileView = useMedia('(max-width: 720px)');

  return (
    <Card
      style={{ marginTop: 24 }}
      title={distribution.name}
      extra={<DistributionPeriod startDate={distribution.startDate} endDate={distribution.endDate} />}
      actions={
        isManager
          ? [
              <Button key="edit" icon={<EditOutlined />} onClick={() => onEdit(distribution)}>
                {!mobileView && 'Edit Team Distribution'}
              </Button>,
              <Button key="delete" icon={<DeleteOutlined />} onClick={() => onDelete(distribution.id)}>
                {!mobileView && 'Delete Team Distribution'}
              </Button>,
            ]
          : undefined
      }
    >
      {distribution.description}
      {distribution.descriptionUrl && (
        <a href={distribution.descriptionUrl} target="_blank">
          {' '}
          Read more
        </a>
      )}
      <Actions distribution={distribution} onRegister={onRegister} onDeleteRegister={onDeleteRegister} />
    </Card>
  );
}
