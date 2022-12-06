import { Typography, Form, Row, Checkbox, Radio } from 'antd';
import moment from 'moment';
import React from 'react';
import { CourseTaskDetailedDto } from 'api';
import { Verification, SelfEducationQuestionWithIndex, SelfEducationPublicAttributes } from 'services/course';
import { getAttemptsLeftMessage } from 'modules/AutoTest/utils/getAttemptsLeftMessage';

type SelfEducationProps = {
  courseTask: CourseTaskDetailedDto;
  verifications: Verification[];
};

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
  const {
    maxAttemptsNumber = 0,
    tresholdPercentage = 0,
    strictAttemptsMode = true,
    oneAttemptPerNumberOfHours = 0,
  } = pubAtts as SelfEducationPublicAttributes;

  const attempts = verifications.filter(v => courseTask?.id === v.courseTaskId);
  const attemptsLeft = maxAttemptsNumber - attempts.length;
  const [lastAttempt] = attempts;
  const lastAttemptTime = lastAttempt?.createdDate;
  const timeToTheNextSubmit = getTimeToTheNextSubmit(oneAttemptPerNumberOfHours, lastAttemptTime);
  const isSubmitAllowed = timeToTheNextSubmit === 0;

  return (
    <>
      <Typography.Paragraph>To submit the task answer the questions.</Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text mark strong>
          Note: You must score at least {tresholdPercentage}% of points to pass. You have only {maxAttemptsNumber}{' '}
          attempts. {!strictAttemptsMode && 'After limit attempts is over you can get only half a score.'}
        </Typography.Text>
      </Typography.Paragraph>
      <Typography.Paragraph>
        {oneAttemptPerNumberOfHours ? (
          <Typography.Text mark strong>
            You have only one attempt per {oneAttemptPerNumberOfHours} hour{oneAttemptPerNumberOfHours !== 1 && 's'}.
          </Typography.Text>
        ) : (
          ''
        )}
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text strong style={{ fontSize: '2em', color: attemptsLeft > 1 ? '#1890ff' : '#cc0000' }}>
          {getAttemptsLeftMessage(attemptsLeft, strictAttemptsMode)}
          {!isSubmitAllowed &&
            attemptsLeft > 0 &&
            ` Next submit is possible in ${formatMilliseconds(timeToTheNextSubmit)}`}
        </Typography.Text>
      </Typography.Paragraph>
      {questions.map(({ question, answers, multiple, index: questionIndex, questionImage, answersType }) => {
        return (
          <Form.Item
            key={questionIndex}
            label={
              <Row>
                {question}
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
