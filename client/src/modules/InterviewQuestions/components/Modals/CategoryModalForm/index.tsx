import { Form, Input, message, Select } from 'antd';
import { Option } from 'antd/lib/mentions';
import Modal from 'antd/lib/modal/Modal';
import { useEffect } from 'react';
import { InterviewQuestionCategoryService } from 'services/interviewQuestion';
import { InterviewQuestion, InterviewQuestionCategory } from 'services/models';

type Props = {
  questions: InterviewQuestion[];
  category: InterviewQuestionCategory | null;
  isVisible: boolean;
  onCancel: () => void;
  loadData: () => Promise<void>;
};

interface IValues {
  name: string;
  questions: string[];
}

export function CategoryModalForm(props: Props) {
  const { category, isVisible, onCancel, questions, loadData } = props;
  const [form] = Form.useForm();
  const interviewQuestionCategoryService = new InterviewQuestionCategoryService();

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, [isVisible]);

  const initialValues = {
    name: category?.name,
    questions: category?.questions.map(el => el.title),
  };

  const createRecord = (values: IValues) => ({
    name: values.name,
    questions: values.questions?.reduce((acc, el) => {
      const question = questions.find(question => question.title === el);
      if (question) acc.push(question);
      return acc;
    }, [] as InterviewQuestion[]),
  });

  const submitCategory = async () => {
    try {
      const values = await form.validateFields();
      const record = createRecord(values);
      if (category?.id) {
        await interviewQuestionCategoryService.updateInterviewQuestionCategory(category.id, { ...category, ...record });
      } else {
        await interviewQuestionCategoryService.createInterviewQuestionCategory(record);
      }
      await loadData();
      message.success(category ? 'Category has been updated' : 'Category has been added');
    } catch (error) {
      message.error('Something went wrong. Please try again later.');
    }
  };

  return (
    <Modal
      title={category ? 'Edit category' : 'Add category'}
      visible={isVisible}
      onCancel={onCancel}
      onOk={submitCategory}
    >
      <Form size="middle" layout="vertical" form={form} initialValues={initialValues}>
        <Form.Item key="name" name="name" label="name" labelAlign="left" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item key="questions" name="questions" label="questions" labelAlign="left">
          <Select mode="multiple" style={{ width: '100%' }} placeholder="Please select">
            {questions.map(el => (
              <Option key={el.title}>{el.title}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
