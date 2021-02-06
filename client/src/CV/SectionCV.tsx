import * as React from 'react';
import { Card, Avatar } from 'antd';

type Props = {
  title?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
};

function SectionCV(props: Props) {
  const { title, icon, content } = props;

  const avatar = icon ? <Avatar icon={icon} /> : null;

  const complexTitle = (
    <>
      {avatar} {title}
    </>
  );

  return (
    <Card title={complexTitle} bordered={false}>
      {content}
    </Card>
  );
}

export default SectionCV;
