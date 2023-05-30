import { Form, Space, Typography, Button } from 'antd';
import { Question as QuestionType } from 'data/interviews/technical-screening';
import { useContext } from 'react';
import { StepContext } from './StepContext';
import { Question } from './Question';

const { Item } = Form;
const { Title, Text } = Typography;

type Values = Record<string, string>;

export function DynamicForm() {
  const [form] = Form.useForm();
  const { activeStepIndex, steps, next, prev } = useContext(StepContext);
  const step = steps[activeStepIndex];
  const isFirst = activeStepIndex === 0;
  const isLast = activeStepIndex === steps.length - 1;

  function handleValuesChange(changedValues: Values, values: Values) {
    console.log(changedValues, values);
  }
  function onFinish(values: Values) {
    next();
  }

  return (
    <Form form={form} onValuesChange={handleValuesChange} style={{ padding: 40 }} onFinish={onFinish}>
      <Space direction="vertical">
        <Item>
          <Title level={3}>{step.title}</Title>
          <Text type="secondary">
            <div dangerouslySetInnerHTML={{ __html: step.description }} />
          </Text>
        </Item>
        {step.questions.map((question: QuestionType) => (
          <div key={question.id}>
            <Title level={5}>{question.title}</Title>
            <Question form={form} question={question} stepId={step.id} />
          </div>
        ))}
        {isLast && (
          <Button type="primary" htmlType="submit" style={{ marginBottom: '40px' }}>
            Submit
          </Button>
        )}
        <Space style={{ justifyContent: 'space-between', display: 'flex' }}>
          {!isFirst ? <Button onClick={prev}>Back</Button> : <div />}
          {!isLast && <Button htmlType="submit">Next</Button>}
        </Space>
      </Space>
    </Form>
  );
}
