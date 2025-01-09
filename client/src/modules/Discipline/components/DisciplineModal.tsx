import { Form, Input, message, Modal } from 'antd';
import { useEffect } from 'react';
import { DisciplineDto, DisciplinesApi } from 'api';

interface IDisciplineModal {
  isModalVisible: boolean;
  onCancel: () => void;
  loadDisciplines: () => Promise<void>;
  discipline: DisciplineDto | null;
}
const disciplineService = new DisciplinesApi();

export function DisciplineModal({ isModalVisible, onCancel, loadDisciplines, discipline }: IDisciplineModal) {
  const [form] = Form.useForm();

  useEffect(() => form.resetFields, [isModalVisible]);

  const initialValues = {
    name: discipline?.name,
  };

  const submitForm = async () => {
    try {
      const value = await form.validateFields();

      if (discipline) {
        await disciplineService.updateDiscipline(discipline.id, value);
      } else {
        await disciplineService.createDiscipline(value);
      }

      await loadDisciplines();
      onCancel();
    } catch {
      message.error('Something went wrong. Please try again later.');
    }
  };

  return (
    <Modal
      title={discipline ? 'Edit discipline' : 'Add discipline'}
      open={isModalVisible}
      onCancel={onCancel}
      onOk={submitForm}
    >
      <Form layout="vertical" form={form} initialValues={initialValues}>
        <Form.Item key="name" name="name" label="Discipline" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
