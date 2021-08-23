import { Form, Input, message, Select } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { Option } from 'antd/lib/mentions';
import Modal from 'antd/lib/modal/Modal';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { InterviewQuestionService } from 'services/interviewQuestion';
import { InterviewQuestion, InterviewQuestionCategory } from 'services/models';

type Props = {
  question: InterviewQuestion | null;
  categories: InterviewQuestionCategory[];
  isVisible: boolean;
  onCancel: () => void;
  loadData: () => Promise<void>;
};

interface IValues {
  title: string;
  question: string;
  categories: string[];
}

export function QuestionsModalForm(props: Props) {
  const { categories, isVisible, onCancel, question, loadData } = props;
  const [form] = Form.useForm();
  const interviewQuestionService = new InterviewQuestionService();

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, [isVisible]);

  const initialValues = {
    title: question?.title,
    question: question?.question,
    categories: question?.categories.map(el => el.name),
  };

  const createRecord = (values: IValues) => {
    return {
      title: values.title,
      question: values.question,
      categories: values.categories.reduce((acc, el) => {
        const category = categories.find(category => category.name === el);
        if (category) acc.push(category);
        return acc;
      }, [] as InterviewQuestionCategory[]),
    };
  };

  const submitQuestion = async () => {
    try {
      const values = await form.validateFields().catch(() => null);
      const record = createRecord(values);
      if (question?.id) {
        await interviewQuestionService.updateInterviewQuestion(question.id, record);
      } else {
        await interviewQuestionService.createInterviewQuestion(record);
      }
      await loadData();
    } catch (error) {
      message.error('Something went wrong. Please try again later.');
    }
  };

  return (
    <Modal
      title={question ? 'Edit question' : 'Add question'}
      visible={isVisible}
      onCancel={onCancel}
      onOk={submitQuestion}
    >
      <Form size="middle" layout="vertical" form={form} initialValues={initialValues}>
        <Form.Item key="title" name="title" label="title" labelAlign="left" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item key="question" name="question" label="question" labelAlign="left" rules={[{ required: true }]}>
          <TextArea rows={4} maxLength={400} />
        </Form.Item>
        <Form.Item key="categories" name="categories" label="categories" labelAlign="left">
          <Select mode="multiple" style={{ width: '100%' }} placeholder="Please select">
            {categories.map(el => (
              <Option key={el.name}>{el.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
