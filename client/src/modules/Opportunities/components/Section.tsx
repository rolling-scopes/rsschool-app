import * as React from 'react';
import { Card, Avatar, Typography } from 'antd';

const { Title } = Typography;

type Props = React.PropsWithChildren<{
  title?: React.ReactNode;
  icon?: React.ReactNode;
}>;

function Section(props: Props) {
  const { title, icon, children } = props;

  const avatar = icon ? <Avatar size={24} icon={icon} /> : null;

  const complexTitle = title ? (
    <Title level={4} style={{ display: 'inline-block' }}>
      {avatar} {title}
    </Title>
  ) : null;

  return (
    <Card className="cv-card-section" size="small" title={complexTitle} bordered={false}>
      {children}
    </Card>
  );
}

export default Section;
