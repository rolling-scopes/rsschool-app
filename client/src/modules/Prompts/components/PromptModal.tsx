import { Form, Input, message, Modal } from 'antd';
import { useEffect } from 'react';
import { PromptDto, PromptsApi } from 'api';

type Props = {
  isModalVisible: boolean;
  onCancel: () => void;
  loadData: () => Promise<void>;
  data: PromptDto | null;
};
const disciplineService = new PromptsApi();

export function PromptModal({ isModalVisible, onCancel, loadData, data }: Props) {
  const [form] = Form.useForm();

  useEffect(() => form.resetFields, [isModalVisible]);

  const initialValues = {
    type: data?.type,
  };

  const submitForm = async () => {
    try {
      const value = await form.validateFields();

      if (data) {
        await disciplineService.updatePrompt(data.id, value);
      } else {
        await disciplineService.createPrompt(value);
      }

      await loadData();
      onCancel();
    } catch (e) {
      message.error('Something went wrong. Please try again later.');
    }
  };

  return (
    <Modal title={data ? 'Edit prompt' : 'Add prompt'} open={isModalVisible} onCancel={onCancel} onOk={submitForm}>
      <Form layout="vertical" form={form} initialValues={initialValues}>
        <Form.Item key="type" name="type" label="Type" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item key="text" name="text" label="Text" rules={[{ required: true }]}>
          <Input.TextArea rows={10} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
