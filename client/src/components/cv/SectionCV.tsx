import * as React from 'react';
import { Card, Avatar, Typography } from 'antd';

const { Title } = Typography;

type Props = {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
  className?: string;
};

function SectionCV(props: Props) {
  const { title, icon, content, className } = props;

  const avatar = icon ? <Avatar size={51} icon={icon} /> : null;

  const complexTitle = title && <Title style={{ display: 'inline-block' }} className={className}>{avatar} {title}</Title>;

  return (
    <Card title={complexTitle} bordered={false}>
      {content}
    </Card>
  );
}

export default SectionCV;
