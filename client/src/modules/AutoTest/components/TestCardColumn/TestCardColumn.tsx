import { Space, Tag, Typography } from 'antd';
import React, { ReactNode } from 'react';

type TestCardColumnProps = {
  label: string;
  value: ReactNode;
};

const { Text } = Typography;

function TestCardColumn({ label, value }: TestCardColumnProps) {
  return (
    <Space direction="vertical">
      <Text type="secondary">{label}</Text>
      {value}
    </Space>
  );
}

export default TestCardColumn;
