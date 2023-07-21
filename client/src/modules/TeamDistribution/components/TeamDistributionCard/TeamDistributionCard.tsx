import { Button, Card } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { TeamDistributionDto } from 'api';
import { Actions } from './Actions';
import { CardTitle } from './CardTitle';

type Props = {
  distribution: TeamDistributionDto;
  isManager: boolean;
  isCourseDementor: boolean;
  onDelete: (id: number) => Promise<void>;
  onEdit: (distribution: TeamDistributionDto) => void;
  register: (distributionId: number) => Promise<void>;
  deleteRegister: (distributionId: number) => Promise<void>;
  courseAlias: string;
};

export default function TeamDistributionCard({
  distribution,
  isManager,
  isCourseDementor,
  onDelete,
  onEdit,
  register,
  deleteRegister,
  courseAlias,
}: Props) {
  return (
    <Card
      style={{ marginTop: 24 }}
      title={<CardTitle distribution={distribution} />}
      actions={
        isManager
          ? [
              <Button key="edit" icon={<EditOutlined />} onClick={() => onEdit(distribution)} />,
              <Button key="delete" icon={<DeleteOutlined />} onClick={() => onDelete(distribution.id)} />,
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
      <Actions
        isManager={isManager}
        isCourseDementor={isCourseDementor}
        distribution={distribution}
        register={register}
        deleteRegister={deleteRegister}
        courseAlias={courseAlias}
      />
    </Card>
  );
}
