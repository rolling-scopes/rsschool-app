import { Typography, Form, Row, Checkbox, Radio, Col } from 'antd';
import { SelfEducationQuestion } from 'services/course';

const { Title } = Typography;

type Props = {
  question: SelfEducationQuestion;
  questionIndex: number;
  questionNumber: number;
  selectedAnswers?: number | number[];
  mode?: 'question' | 'answer';
};

function Question({
  question: selfEducationQuestion,
  questionIndex,
  questionNumber,
  selectedAnswers,
  mode = 'question',
}: Props): JSX.Element {
  const { question, questionImage, answers, answersType, multiple } = selfEducationQuestion;
  const Element = multiple ? Checkbox : Radio;

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
      <Element.Group>
        {answers?.map((answer, answerIndex) => {
          // TODO: double check that it is not question mode
          // FIXME: not working
          const checked = Array.isArray(selectedAnswers)
            ? selectedAnswers?.includes(answerIndex)
            : selectedAnswers === answerIndex;
          return (
            <Row key={answerIndex}>
              <Element value={answerIndex} defaultChecked={checked} disabled={mode === 'answer'}>
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
