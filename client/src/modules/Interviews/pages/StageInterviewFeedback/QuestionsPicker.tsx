import { Checkbox, Form, Modal, Row } from 'antd';
import { InterviewQuestion } from 'data/interviews/technical-screening';

const { Item } = Form;

export function QuestionsPicker({
  questions,
  onCancel,
  onSave,
}: {
  questions: InterviewQuestion[];
  onCancel: () => void;
  onSave: (questions: string[]) => void;
}) {
  const [form] = Form.useForm();

  function onFinish(values: { questions: string[] }) {
    onSave(values.questions);
  }

  return (
    <Modal
      open
      title="Add question"
      okButtonProps={{ htmlType: 'submit' }}
      onOk={form.submit}
      okText="Add"
      onCancel={onCancel}
    >
      <Form form={form} style={{ padding: 40 }} onFinish={onFinish}>
        <Item
          name={'questions'}
          rules={[{ required: true, message: 'Please select questions to add to the feedback' }]}
        >
          <Checkbox.Group style={{ flexDirection: 'column' }}>
            {questions.map(question => (
              <Row key={question.id}>
                <Checkbox value={question.id}>{question.title}</Checkbox>
              </Row>
            ))}
          </Checkbox.Group>
        </Item>
      </Form>
    </Modal>
  );
}
