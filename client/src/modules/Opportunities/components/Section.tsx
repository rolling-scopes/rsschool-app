import * as React from 'react';
import { Card, Avatar, Typography } from 'antd';

const { Title } = Typography;

type Props = {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
};

function Section(props: Props) {
  const { title, icon, content } = props;

  const avatar = icon ? <Avatar size={24} icon={icon} /> : null;

  const complexTitle = title && (
    <Title level={4} style={{ display: 'inline-block' }}>
      {avatar} {title}
    </Title>
  );

  return (
    <Card className="cv-card-section" size="small" title={complexTitle} bordered={false}>
      {content}
    </Card>
  );
}

export default Section;
