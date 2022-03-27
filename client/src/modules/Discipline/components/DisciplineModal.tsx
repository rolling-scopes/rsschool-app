import { Form, Input, message, Modal } from 'antd';
import { useEffect, useMemo } from 'react';
import { DisciplineService } from '../../../services/discipline';
import { IDiscipline } from '../model';

interface IDisciplineModal {
  isModalVisible: boolean;
  onCancel: () => void;
  loadDisciplines: () => Promise<void>;
  discipline: IDiscipline | null;
}

export function DisciplineModal({ isModalVisible, onCancel, loadDisciplines, discipline }: IDisciplineModal) {
  const disciplineService = useMemo(() => new DisciplineService(), []);
  const [form] = Form.useForm();

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, [isModalVisible]);

  const initialValues = {
    name: discipline?.name,
  };

  const submitForm = async () => {
    try {
      const value = await form.validateFields();

      if (discipline) {
        await disciplineService.updateDiscipline(discipline.id, value);
      } else {
        await disciplineService.postDiscipline(value);
      }

      await loadDisciplines();
      onCancel();
    } catch (e) {
      message.error('Something went wrong. Please try again later.');
    }
  };

  return (
    <Modal
      title={discipline ? 'Edit discipline' : 'Add discipline'}
      visible={isModalVisible}
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
