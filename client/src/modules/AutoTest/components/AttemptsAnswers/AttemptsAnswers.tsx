import { Col, Row, Typography, Form, Space } from 'antd';
import { TaskVerificationAttemptDto } from 'api';
import { Question } from 'modules/AutoTest/components';
import moment from 'moment';
import { Fragment } from 'react';
import { CalendarOutlined } from '@ant-design/icons';

type Props = {
  attempts: TaskVerificationAttemptDto[];
};

const { Title, Text } = Typography;

// TODO: deal with typings for Question
function AttemptsAnswers({ attempts }: Props) {
  return (
    <Row style={{ background: 'white', padding: '0 24px 24px' }} gutter={[0, 24]} justify="center">
      <Col xs={24} lg={18} xl={12}>
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
                  {/* TODO: add maxScore into endpoint */}
                  <Text type="secondary">
                    Score: {attempt.score} / {attempt.maxScore}
                  </Text>
                </Col>
              </Row>
              {attempt.questions.map((question: any, questionIdx) => (
                <Question key={questionIdx} question={question} questionIndex={questionIdx} />
              ))}
            </Fragment>
          ))}
        </Form>
      </Col>
    </Row>
  );
}

export default AttemptsAnswers;
