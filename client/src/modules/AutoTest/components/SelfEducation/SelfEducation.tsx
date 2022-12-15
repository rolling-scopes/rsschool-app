import { Typography, Form, Row, Checkbox, Radio } from 'antd';
import moment from 'moment';
import { useMemo } from 'react';
import { SelfEducationQuestionWithIndex, SelfEducationQuestion } from 'services/course';
import shuffle from 'lodash/shuffle';
import { CourseTaskVerifications } from 'modules/AutoTest/types';

type SelfEducationProps = {
  courseTask: CourseTaskVerifications;
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

function getRandomQuestions(questions: SelfEducationQuestion[]): SelfEducationQuestionWithIndex[] {
  const questionsWithIndex = questions?.map((question, index) => ({ ...question, index }));
  return shuffle(questionsWithIndex);
}

function SelfEducation({ courseTask }: SelfEducationProps) {
  const { publicAttributes, verifications } = courseTask;
  const { maxAttemptsNumber = 0, oneAttemptPerNumberOfHours = 0, questions } = publicAttributes || {};
  const attempts = verifications;
  const attemptsLeft = maxAttemptsNumber - attempts.length;
  const [lastAttempt] = attempts;
  const lastAttemptTime = lastAttempt?.createdDate;
  // TODO: check timeToTheNextSubmit
  const timeToTheNextSubmit = getTimeToTheNextSubmit(oneAttemptPerNumberOfHours, lastAttemptTime);
  const isSubmitAllowed = timeToTheNextSubmit === 0;

  const randomQuestions = useMemo(() => getRandomQuestions(questions), [questions?.length]);

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
      {randomQuestions?.map(
        ({ question, answers, multiple, questionImage, answersType, index: questionIndex }, idx) => {
          const questionNumber = idx + 1;
          return (
            <Form.Item
              key={questionIndex}
              label={
                <Row>
                  <Title level={5}>
                    {questionNumber}. {question}
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
                  {answers?.map((answer, answerIndex) => (
                    <Row key={answerIndex}>
                      <Checkbox value={answerIndex}>
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
                    </Row>
                  ))}
                </Checkbox.Group>
              ) : (
                <Radio.Group>
                  {answers?.map((answer, index) => (
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
        },
      )}
    </>
  );
}

export default SelfEducation;
