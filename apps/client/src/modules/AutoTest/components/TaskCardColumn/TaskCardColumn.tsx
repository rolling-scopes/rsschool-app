import { Space, Typography } from 'antd';
import { ReactNode } from 'react';

type TaskCardColumnProps = {
  label: string;
  value: ReactNode;
};

const { Text } = Typography;

function TaskCardColumn({ label, value }: TaskCardColumnProps) {
  return (
    <Space direction="vertical">
      <Text type="secondary">{label}</Text>
      {value}
    </Space>
  );
}

export default TaskCardColumn;
