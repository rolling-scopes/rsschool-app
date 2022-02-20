import { HeartTwoTone } from '@ant-design/icons';
import { Button, Col, Result, Row } from 'antd';
import { RSSCHOOL_BOT_LINK } from 'modules/Registry/constants';

export function MentorStepSuccess() {
  const titleCmp = (
    <Row gutter={24} justify="center">
      <Col xs={18} sm={16} md={12}>
        <p>Your application has been saved!</p>
        <p>
          Subscribe to our <a href={RSSCHOOL_BOT_LINK}>Telegram-bot</a>. Before the start of the course, it will send
          you the message to confirm your participation in the course and provide the next steps.
        </p>
        <p>
          Thanks a lot for your interest! <HeartTwoTone twoToneColor="#eb2f96" />
        </p>
        <p>
          <Button size="large" type="primary" href="/">
            Go to Home
          </Button>
        </p>
      </Col>
    </Row>
  );
  return <Result status="info" title={titleCmp} />;
}
