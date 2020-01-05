import { MehTwoTone } from '@ant-design/icons';
import { Button, Result } from 'antd';
import * as React from 'react';

export function NoCourses() {
  return (
    <Result
      status="info"
      icon={<MehTwoTone />}
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
