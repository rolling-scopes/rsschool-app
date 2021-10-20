import * as React from 'react';
import { Card, Avatar, Typography } from 'antd';

const { Title } = Typography;

type Props = {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
  className?: string;
};

function Section(props: Props) {
  const { title, icon, content, className } = props;

  const avatar = icon ? <Avatar size={24} icon={icon} /> : null;

  const complexTitle = title && (
    <Title level={4} style={{ display: 'inline-block' }} className={className}>
      {avatar} {title}
    </Title>
  );

  return (
    <Card size="small" title={complexTitle} bordered={false}>
      {content}
    </Card>
  );
}

export default Section;
