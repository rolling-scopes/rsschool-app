import { ReactNode } from 'react';
import { Card, Typography, Empty } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const { Title } = Typography;

type Props = {
  noDataDescription?: string;
  title: string;
  icon: JSX.Element;
  content: JSX.Element | null;
  actions?: ReactNode[];
  handleEdit?: () => void;
};

const CommonCard = ({ title, icon, content, noDataDescription, actions, handleEdit }: Props) => {
  return (
    <Card
      title={
        <Title
          level={2}
          ellipsis={true}
          style={{
            fontSize: 16,
            marginBottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>
            {icon} {title}
          </span>
          {handleEdit ? <EditOutlined key="main-card-actions-edit" onClick={handleEdit} /> : null}
        </Title>
      }
      actions={actions}
    >
      {content ?? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={noDataDescription} />}
    </Card>
  );
};

export default CommonCard;
