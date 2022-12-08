import { Typography, Form, Row, Checkbox, Radio } from 'antd';
import moment from 'moment';
import React from 'react';
import { CourseTaskDetailedDto } from 'api';
import { Verification, SelfEducationQuestionWithIndex, SelfEducationPublicAttributes } from 'services/course';

type SelfEducationProps = {
  courseTask: CourseTaskDetailedDto;
  verifications: Verification[];
};

const { Paragraph, Text, Title } = Typography;

function getTimeToTheNextSubmit(hours: number, lastAttemptTime?: string) {
  if (!hours || !lastAttemptTime) return 0;
  const diff = moment(lastAttemptTime).diff(moment().subtract(hours, 'hour'));
  if (diff < 0) return 0;
  return diff;
}

// todo: recheck
function formatMilliseconds(ms: number) {
  return moment.utc(ms).format('HH:mm:ss');
}

function SelfEducation({ courseTask, verifications }: SelfEducationProps) {
  const pubAtts = (courseTask?.publicAttributes ?? {}) as Record<string, any>;
  const questions = (pubAtts.questions as SelfEducationQuestionWithIndex[]) || [];
  const { maxAttemptsNumber = 0, oneAttemptPerNumberOfHours = 0 } = pubAtts as SelfEducationPublicAttributes;

  const attempts = verifications.filter(v => courseTask?.id === v.courseTaskId);
  const attemptsLeft = maxAttemptsNumber - attempts.length;
  const [lastAttempt] = attempts;
  const lastAttemptTime = lastAttempt?.createdDate;
  const timeToTheNextSubmit = getTimeToTheNextSubmit(oneAttemptPerNumberOfHours, lastAttemptTime);
  const isSubmitAllowed = timeToTheNextSubmit === 0;

  // TODO: review and move to proper place
  function renderInfo() {
    return (
      <>
        <Paragraph>To submit the task answer the questions.</Paragraph>
        <Paragraph>
          {oneAttemptPerNumberOfHours ? (
            <Text mark strong>
              You have only one attempt per {oneAttemptPerNumberOfHours} hour{oneAttemptPerNumberOfHours !== 1 && 's'}.
            </Text>
          ) : null}
        </Paragraph>
        <Paragraph>
          <Text strong style={{ fontSize: '2em', color: attemptsLeft > 1 ? '#1890ff' : '#cc0000' }}>
            {!isSubmitAllowed && attemptsLeft > 0
              ? ` Next submit is possible in ${formatMilliseconds(timeToTheNextSubmit)}`
              : null}
          </Text>
        </Paragraph>
      </>
    );
  }

  return (
    <>
      {renderInfo()}
      {questions.map(({ question, answers, multiple, questionImage, answersType }, idx) => {
        const questionIndex = idx + 1;
        return (
          <Form.Item
            key={questionIndex}
            label={
              <Row>
                <Title level={5}>
                  {questionIndex}. {question}
                </Title>
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
              </Row>
            }
            name={`answer-${questionIndex}`}
            rules={[{ required: true, message: 'Please answer the question' }]}
          >
            {multiple ? (
              <Checkbox.Group>
                {answers.map((answer, index) => (
                  <Row key={index}>
                    <Checkbox value={index}>
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
                    </Checkbox>
                  </Row>
                ))}
              </Checkbox.Group>
            ) : (
              <Radio.Group>
                {answers.map((answer, index) => (
                  <Row key={index}>
                    <Radio value={index}>
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
                  </Row>
                ))}
              </Radio.Group>
            )}
          </Form.Item>
        );
      })}
    </>
  );
}

export default SelfEducation;
