import { Card } from 'antd';
import { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  children?: ReactNode;
};

export function FormCard({ title, children }: Props) {
  return (
    <Card title={title} bordered={false} style={{ width: '100%' }}>
      {children}
    </Card>
  );
}
