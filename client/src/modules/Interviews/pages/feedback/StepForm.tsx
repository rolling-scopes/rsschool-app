import { Form, Space, Typography, Button } from 'antd';
import { FeedbackStep, InterviewFeedbackValues, StepFormItem } from 'data/interviews/technical-screening';
import { FormItem } from './FormItem';
import { InputType } from 'data/interviews';

const { Title, Text } = Typography;

type Values = Record<string, string>;

type Props = {
  step: FeedbackStep;
  back: () => void;
  next: (values: Values) => void;
  onValuesChange: (changedValues: Values, values: Values) => void;
  isLast: boolean;
  isFirst: boolean;
};

export function StepForm({ step, next, back, isFirst, isLast, onValuesChange }: Props) {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      style={{ padding: 40 }}
      onFinish={next}
      onValuesChange={onValuesChange}
      initialValues={getInitialQuestions(step)}
      onFinishFailed={({ errorFields: [errorField] }) => form.scrollToField(errorField.name)}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item>
          <Title level={3}>{step.title}</Title>
          <Text type="secondary">{step.description}</Text>
        </Form.Item>
        {step.items.map((item: StepFormItem) => (
          <div key={item.id}>
            <Title level={5}>{item.title}</Title>
            <FormItem form={form} item={item} stepId={step.id} />
          </div>
        ))}

        <Space style={{ justifyContent: 'space-between', display: 'flex' }}>
          {!isFirst ? <Button onClick={back}>Back</Button> : <div />}
          {<Button htmlType="submit">{isLast ? 'Submit' : 'Next'}</Button>}
        </Space>
      </Space>
    </Form>
  );
}

function getInitialQuestions(step: FeedbackStep) {
  const { items, values } = step;

  if (values) {
    return values;
  }

  // if values are not yet defined(ie feedback is not yet submitted), initialize dynamic questions with default structure
  return items.reduce((acc: InterviewFeedbackValues, item) => {
    if (item.type === InputType.Rating) {
      acc[item.id] = item.questions;
    }
    if (item.type === InputType.Input && item.defaultValue) {
      acc[item.id] = item.defaultValue;
    }
    return acc;
  }, {});
}
