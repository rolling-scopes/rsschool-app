import { Space, Typography } from 'antd';
import { ReactNode } from 'react';

const { Title, Text } = Typography;

type Props = {
  title: ReactNode;
};

export function Header({ title }: Props) {
  return (
    <Space direction="vertical" align="center" size={0} style={{ textAlign: 'center' }}>
      <Title>{title}</Title>
      <Text type="secondary">Free courses from the developer community</Text>
    </Space>
  );
}
