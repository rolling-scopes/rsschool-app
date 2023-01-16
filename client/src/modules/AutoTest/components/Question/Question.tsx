import { Typography, Form, Row, Checkbox, Radio, Col } from 'antd';
import { SelfEducationQuestionSelectedAnswersDto } from 'api';

const { Title } = Typography;

type Props = {
  question: SelfEducationQuestionSelectedAnswersDto;
  questionIndex: number;
};

function Question({ question: selfEducationQuestion, questionIndex }: Props): JSX.Element {
  const { question, questionImage, answers, answersType, multiple, selectedAnswers } = selfEducationQuestion;
  const Element = multiple ? Checkbox : Radio;

  return (
    <Form.Item
      key={questionIndex}
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
        {answers?.map((answer, answerIndex) => {
          const checked = Array.isArray(selectedAnswers)
            ? selectedAnswers?.includes(answerIndex)
            : selectedAnswers === answerIndex;

          return (
            <Row key={answerIndex}>
              <Element value={answerIndex} checked={checked}>
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
            </Row>
          );
        })}
      </Element.Group>
    </Form.Item>
  );
}

export default Question;
