import { Space, Tag, Typography } from 'antd';
import React, { ReactNode } from 'react';

type TestCardColumnProps = {
  isTag?: boolean;
  label: string;
  value: string | ReactNode;
};

const { Text } = Typography;

function TestCardColumn({ label, value, isTag = false }: TestCardColumnProps) {
  return (
    <Space direction="vertical">
      <Text type="secondary">{label}</Text>
      {isTag ? <Tag>{value}</Tag> : <Text>{value}</Text>}
    </Space>
  );
}

export default TestCardColumn;
