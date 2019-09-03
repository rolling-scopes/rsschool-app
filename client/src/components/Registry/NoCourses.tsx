import { Button, Icon, Result } from 'antd';
import * as React from 'react';

export function NoCourses() {
  return (
    <Result
      status="info"
      icon={<Icon type="meh" theme="twoTone" />}
      title="There are no planned courses."
      subTitle="Please come back later."
      extra={
        <Button type="primary" href="/">
          Back to Home
        </Button>
      }
    />
  );
}
