import { MehTwoTone } from '@ant-design/icons';
import { Button, Result } from 'antd';

export function NoCourses() {
  return (
    <Result
      status="info"
      icon={<MehTwoTone />}
      title="There are no available courses."
      subTitle="Please come back later."
      extra={
        <Button type="primary" href="/">
          Back to Home
        </Button>
      }
    />
  );
}
