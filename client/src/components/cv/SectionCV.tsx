import * as React from 'react';
import { Card } from 'antd';

type Props = {
  title?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
};

function SectionCV(props: Props) {
  const { title, icon, content } = props;

  return (
    <Card title={title || null} bordered={false}>
      <Card.Meta avatar={icon || null}></Card.Meta>
      {content}
    </Card>
  );
}

export default SectionCV;
