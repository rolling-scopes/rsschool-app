import { Col, Row, Typography, Form } from 'antd';
import { TaskVerificationAttemptDto } from 'api';
import { Question } from 'modules/AutoTest/components';
import { Fragment } from 'react';
import { SelfEducationQuestion } from 'services/course';

type Props = {
  answers: TaskVerificationAttemptDto[];
};

const { Title } = Typography;

// TODO: deal with typings for Question
function AttemptsAnswers({ answers }: Props) {
  return (
    <Form layout="vertical" requiredMark={false}>
      <Row style={{ background: 'white', padding: '0 24px 24px' }} gutter={[0, 24]} justify="center">
        <Col xs={24} lg={18} xl={12}>
          {answers.map((answer, idx) => (
            <Fragment key={idx}>
              <Row>
                <Title level={4}>Attempt #{answers.length - idx}</Title>
              </Row>
              {answer.questions.map((question: any, questionIdx) => (
                <Question
                  key={questionIdx}
                  question={question as SelfEducationQuestion}
                  questionIndex={questionIdx}
                  questionNumber={questionIdx + 1}
                  selectedAnswers={question.selectedAnswers}
                  mode="answer"
                />
              ))}
            </Fragment>
          ))}
        </Col>
      </Row>
    </Form>
  );
}

export default AttemptsAnswers;
