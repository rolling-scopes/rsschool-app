import { Typography, Form, Row, Checkbox, Radio, Col, Space } from 'antd';
import { SelfEducationQuestionSelectedAnswersDto } from 'api';
import css from 'styled-jsx/css';

const { Title } = Typography;

type Props = {
  question: SelfEducationQuestionSelectedAnswersDto;
  questionIndex: number;
};

function Question({ question: selfEducationQuestion, questionIndex }: Props): JSX.Element {
  const { question, questionImage, answers, answersType, multiple, selectedAnswers } = selfEducationQuestion;
  const Element = multiple ? Checkbox : Radio;

  return (
    <div className="question">
      <Form.Item
        label={
          <Row>
            <Col>
              <Title level={5}>{question}</Title>
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
        valuePropName="checked"
      >
        <Element.Group value={selectedAnswers as any}>
          <Space direction="vertical" size="small">
            {answers?.map((answer, answerIndex) => {
              const checked = Array.isArray(selectedAnswers)
                ? selectedAnswers?.includes(answerIndex)
                : selectedAnswers === answerIndex;

              return (
                <Element key={answerIndex} value={answerIndex} checked={checked}>
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
                </Element>
              );
            })}
          </Space>
        </Element.Group>
      </Form.Item>
      <style jsx>{styles}</style>
    </div>
  );
}

const styles = css`
  .question :global(.ant-radio) {
    align-self: flex-start !important;
    margin-top: 3px !important;
  }
`;

export default Question;
