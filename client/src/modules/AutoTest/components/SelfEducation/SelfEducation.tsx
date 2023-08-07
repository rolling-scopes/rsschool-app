import { Typography, Form, Row, Checkbox, Radio, Col, Space } from 'antd';
import { useMemo } from 'react';
import { SelfEducationQuestionWithIndex, SelfEducationQuestion } from 'services/course';
import shuffle from 'lodash/shuffle';
import { CourseTaskVerifications } from 'modules/AutoTest/types';
import css from 'styled-jsx/css';

type SelfEducationProps = {
  courseTask: CourseTaskVerifications;
};

const { Paragraph, Title } = Typography;

function getRandomQuestions(questions: SelfEducationQuestion[]): SelfEducationQuestionWithIndex[] {
  const questionsWithIndex = questions?.map((question, index) => ({ ...question, index }));
  return shuffle(questionsWithIndex);
}

function SelfEducation({ courseTask }: SelfEducationProps) {
  const { questions, numberOfQuestions } = courseTask.publicAttributes || {};

  const randomQuestions = useMemo(
    () => (getRandomQuestions(questions) || []).slice(0, numberOfQuestions),
    [questions?.length, numberOfQuestions],
  );

  return (
    <div className="self-education">
      <Paragraph>To submit the task answer the questions.</Paragraph>
      {randomQuestions?.map(
        ({ question, answers, multiple, questionImage, answersType, index: questionIndex }, idx) => {
          const questionNumber = idx + 1;
          return (
            <Form.Item
              key={questionIndex}
              label={
                <Row>
                  <Col>
                    <Title level={5}>
                      {questionNumber}. {question}
                    </Title>
                  </Col>
                  <Col span={24}>
                    {questionImage && (
                      <img
                        src={questionImage}
                        style={{
                          width: '100%',
                          maxWidth: '700px',
                          marginBottom: '10px',
                        }}
                      />
                    )}
                  </Col>
                </Row>
              }
              name={`answer-${questionIndex}`}
              rules={[{ required: true, message: 'Please answer the question' }]}
            >
              {multiple ? (
                <Checkbox.Group>
                  <Space direction="vertical" size="small">
                    {answers?.map((answer, answerIndex) => (
                      <Checkbox key={answerIndex} value={answerIndex}>
                        {answersType === 'image' ? (
                          <>
                            ({answerIndex + 1}){' '}
                            <img
                              src={answer}
                              style={{
                                width: '100%',
                                maxWidth: '400px',
                                marginBottom: '10px',
                              }}
                            />
                          </>
                        ) : (
                          answer
                        )}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              ) : (
                <Radio.Group>
                  <Space direction="vertical" size="small">
                    {answers?.map((answer, index) => (
                      <Radio key={index} value={index}>
                        {answersType === 'image' ? (
                          <>
                            ({index + 1}){' '}
                            <img
                              src={answer}
                              style={{
                                width: '100%',
                                maxWidth: '400px',
                                marginBottom: '10px',
                              }}
                            />
                          </>
                        ) : (
                          answer
                        )}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              )}
            </Form.Item>
          );
        },
      )}
      <style jsx>{styles}</style>
    </div>
  );
}

const styles = css`
  .self-education :global(.ant-radio) {
    align-self: flex-start !important;
    margin-top: 3px !important;
  }
`;

export default SelfEducation;
