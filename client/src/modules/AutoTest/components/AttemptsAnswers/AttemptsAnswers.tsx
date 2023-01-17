import { Col, Row, Typography, Form, Space, Button } from 'antd';
import { TaskVerificationAttemptDto } from 'api';
import { Question } from 'modules/AutoTest/components';
import moment from 'moment';
import { Fragment } from 'react';
import { CalendarOutlined } from '@ant-design/icons';

type Props = {
  attempts: TaskVerificationAttemptDto[];
  hideAnswers: () => void;
};

const { Title, Text } = Typography;

function AttemptsAnswers({ attempts, hideAnswers }: Props) {
  return (
    <Row style={{ background: 'white', padding: 24 }} gutter={[0, 24]} justify="center">
      <Col xs={24} lg={18} xl={12}>
        <Row style={{ marginBottom: 16 }} wrap={false}>
          <Col flex="auto">Check your incorrect answers per attempt.</Col>
          <Col flex="none">
            <Button onClick={hideAnswers}>Back to table</Button>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form layout="vertical" requiredMark={false} disabled={true}>
              {attempts.map((attempt, idx) => (
                <Fragment key={idx}>
                  <Row style={{ marginBottom: '0.5em' }}>
                    <Col flex="auto">
                      <Title level={4} style={{ margin: 0 }}>
                        Attempt #{attempts.length - idx}
                      </Title>
                    </Col>
                    <Col flex="none">
                      <Text type="secondary">
                        <Space>
                          <CalendarOutlined />
                          {moment(attempt.createdDate).format('YYYY-MM-DD HH:mm')}
                        </Space>
                      </Text>
                    </Col>
                    <Col span={24}>
                      <Text type="secondary">
                        Score: {attempt.score} / {attempt.maxScore}
                      </Text>
                    </Col>
                  </Row>
                  {attempt.questions?.map((question, questionIdx) => (
                    <Question key={questionIdx} question={question} questionIndex={questionIdx} />
                  ))}
                </Fragment>
              ))}
            </Form>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export default AttemptsAnswers;
