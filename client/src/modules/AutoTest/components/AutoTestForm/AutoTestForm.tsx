import { Button, Form, InputNumber, Card, Row, Col, Switch, Space } from 'antd';
import { useMemo } from 'react';
import { AutoTestTaskDto } from 'api';
import { QuestionEditor } from './QuestionEditor';
import { EditAutoTestFormData } from './data/types';

type EditTaskFormProps = {
  selectedTask: AutoTestTaskDto;
  onCancel: () => void;
  onSave: (updatedTask: AutoTestTaskDto) => void;
};

export default function EditTaskForm({ selectedTask, onCancel, onSave }: EditTaskFormProps) {
  const [form] = Form.useForm<EditAutoTestFormData>();
  const initialFormValues = useMemo(() => {
    const pub = selectedTask.attributes.public;
    const processedQuestions = pub.questions.map((q, idx) => {
      if (q.multiple) {
        return {
          question: q.question,
          questionImage: q.questionImage || '',
          answersType: q.answersType || 'text',
          multiple: q.multiple,
          answers: q.answers.map((ans: string, aIdx: number) => ({
            text: ans,
            correct: selectedTask.attributes.answers?.[idx]?.includes(aIdx) || false,
          })),
        };
      } else {
        return {
          question: q.question,
          questionImage: q.questionImage || '',
          answersType: q.answersType || 'text',
          multiple: q.multiple,
          answers: q.answers.map((ans: string) => ({ text: ans })),
          correctIndex: selectedTask.attributes.answers?.[idx]?.[0],
        };
      }
    });
    return { ...pub, questions: processedQuestions };
  }, [selectedTask]);

  const handleSave = (values: any) => {
    const { questions, ...rest } = values;
    const updatedQuestions = questions.map((q: any) => ({
      question: q.question,
      questionImage: q.questionImage,
      answersType: q.answersType,
      multiple: q.multiple,
      answers: q.answers.map((a: any) => a.text),
    }));
    const updatedAnswers = questions.map((q: any) => {
      if (q.multiple) {
        return q.answers.reduce((acc: number[], a: any, idx: number) => (a.correct ? [...acc, idx] : acc), []);
      } else {
        return typeof q.correctIndex === 'number' ? [q.correctIndex] : [];
      }
    });
    onSave({
      ...selectedTask,
      attributes: { public: { ...rest, questions: updatedQuestions }, answers: updatedAnswers },
    });
  };

  return (
    <Card className="autoTestForm" size="small" title={`Edit ${selectedTask.name}`}>
      <Form form={form} initialValues={initialFormValues} onFinish={handleSave} layout="vertical" size="small">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Card type="inner" title="Test Settings">
            <Row gutter={8}>
              {[
                {
                  label: 'Max Attempts',
                  name: 'maxAttemptsNumber',
                  component: <InputNumber min={1} style={{ width: '100%' }} />,
                },
                {
                  label: 'Number of Questions',
                  name: 'numberOfQuestions',
                  component: <InputNumber min={1} style={{ width: '100%' }} />,
                },
                {
                  label: 'Threshold (%)',
                  name: 'tresholdPercentage',
                  component: <InputNumber min={0} max={100} style={{ width: '100%' }} />,
                },
                { label: 'Strict Mode', name: 'strictAttemptsMode', component: <Switch />, valuePropName: 'checked' },
              ].map(({ label, name, component, valuePropName }) => (
                <Col key={label} xs={24} sm={12} md={6}>
                  <Form.Item label={label} name={name} {...(valuePropName ? { valuePropName } : {})}>
                    {component}
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Card>
          <Card type="inner" title="Questions" style={{ marginBottom: 10 }}>
            <Form.List name="questions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(field => (
                    <QuestionEditor key={field.key} field={field} form={form} removeQuestion={remove} />
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      + Add Question
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>
        </Space>
        <Row justify="end" gutter={8}>
          <Col>
            <Button onClick={onCancel}>Cancel</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Col>
        </Row>
      </Form>
      <style jsx global>{`
        .autoTestForm .ant-form-item {
          margin-bottom: 12px !important;
        }
      `}</style>
    </Card>
  );
}
