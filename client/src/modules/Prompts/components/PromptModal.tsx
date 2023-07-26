import { Form, Input, InputNumber, message, Modal } from 'antd';
import { useEffect } from 'react';
import { PromptDto, PromptsApi } from 'api';

type Props = {
  open: boolean;
  onCancel: () => void;
  loadData: () => Promise<void>;
  data?: PromptDto;
};
const disciplineService = new PromptsApi();

export function PromptModal({ open, onCancel, loadData, data }: Props) {
  const [form] = Form.useForm();

  useEffect(() => form.resetFields, [open]);

  const initialValues = data ?? {};

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
    <Modal width={600} title={data ? 'Edit prompt' : 'Add prompt'} open={open} onCancel={onCancel} onOk={submitForm}>
      <Form layout="vertical" form={form} initialValues={initialValues}>
        <Form.Item key="type" name="type" label="Type" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item key="temperature" name="temperature" label="Temperature" rules={[{ required: true }]}>
          <InputNumber min={0} max={1} defaultValue={0.5} />
        </Form.Item>
        <Form.Item key="text" name="text" label="Text" rules={[{ required: true }]}>
          <Input.TextArea rows={16} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
