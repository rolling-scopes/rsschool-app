import { Form, Space, Button, Row, Col, Typography } from 'antd';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { QuestionCard } from './QuestionCard';
import { QuestionsPicker } from './QuestionsPicker';
import { useMemo, useState } from 'react';
import { QuestionItem, InterviewQuestion, FeedbackStepId } from 'data/interviews/technical-screening';
import { FormInstance } from 'antd/lib';
import { CustomQuestion } from './CustomQuestion';

const { Text } = Typography;

type Props = {
  question: QuestionItem;
  form: FormInstance;
  stepId: FeedbackStepId;
};

export function QuestionList({ form, question, stepId }: Props) {
  const { examples = [], id, required, tooltips } = question;
  const [addModeActive, setAddModeActive] = useState<null | 'custom' | 'prepared'>(null);

  const formQuestions = Form.useWatch<InterviewQuestion[] | undefined>(question.id, { form });

  // filter out already added questions
  const pickerQuestions = useMemo(() => {
    return examples.filter(
      (question: InterviewQuestion) => formQuestions?.some(({ id }) => id === question.id) !== true,
    );
  }, [formQuestions]);

  return (
    <>
      <Form.List name={question.id}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ name }) => {
              const question: InterviewQuestion = form.getFieldValue(id)[name];

              return (
                <Row key={question.id} align={'middle'} style={{ marginBottom: 16 }}>
                  <QuestionCard
                    fieldName={[`${name}`, 'value']}
                    required={required}
                    tooltips={tooltips}
                    content={
                      <>
                        {question.topic && (
                          <Row>
                            <Text type="secondary">{question.topic}</Text>
                          </Row>
                        )}
                        <Text>{question.title}</Text>
                      </>
                    }
                  />
                  {fields.length > 1 && (
                    <Col style={{ paddingLeft: 20 }}>
                      <DeleteOutlined onClick={() => remove(name)} />
                    </Col>
                  )}
                </Row>
              );
            })}

            {addModeActive === 'prepared' && (
              <QuestionsPicker
                questions={pickerQuestions}
                onSave={questions => onAddQuestion(questions, add)}
                onCancel={() => setAddModeActive(null)}
              />
            )}

            {addModeActive === 'custom' && (
              <CustomQuestion cancel={() => setAddModeActive(null)} save={question => onAddQuestion([question], add)} />
            )}

            <Space style={{ margin: '30px 0' }}>
              {pickerQuestions.length > 0 && (
                <Button ghost type="primary" onClick={() => setAddModeActive('prepared')} icon={<PlusOutlined />}>
                  Add from list
                </Button>
              )}
              <Button ghost type="primary" onClick={() => setAddModeActive('custom')} icon={<PlusOutlined />}>
                Custom {stepId === FeedbackStepId.Practice ? 'task' : 'question'}
              </Button>
            </Space>
          </>
        )}
      </Form.List>
    </>
  );

  function onAddQuestion(toAdd: string[], add: (question: InterviewQuestion) => void) {
    if (addModeActive === 'prepared') {
      examples.filter(({ id }) => toAdd.includes(id)).forEach(question => add(question));
    } else {
      toAdd.forEach(question => add({ id: generateId(), title: question }));
    }
    setAddModeActive(null);
  }
}

function generateId() {
  const randomNum = Math.random();
  const id = randomNum.toString(36).substring(2, 11); // Generate a string of 9 characters
  return id;
}
