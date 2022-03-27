import { Form, Input, Modal } from 'antd';
import { IDiscipline } from '../model';
import { useEffect, useMemo } from 'react';
import { DisciplineService } from '../../../services/discipline';
import { useDisciplineContext } from '../contexts/DisciplineContext';
import { addDiscipline, updateDiscipline } from '../reducers/actions';

interface IDisciplineModal {
  isModalVisible: boolean;
  setIsModalVisible: (arg: boolean) => void;
  discipline?: IDiscipline;
}

export const DisciplineModal = ({ isModalVisible, setIsModalVisible, discipline }: IDisciplineModal) => {
  const disciplineService = useMemo(() => new DisciplineService(), []);
  const [form] = Form.useForm();
  const { dispatch } = useDisciplineContext();

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (!discipline) form.resetFields();

  useEffect(() => {
    if (discipline) {
      form.setFieldsValue(discipline);
    }
    return () => {
      form.resetFields();
    };
  }, [discipline]);

  const saveDiscipline = async () => {
    const value = await form.validateFields();
    if (!value?.id) {
      const res = await disciplineService.postDiscipline(value);
      addDiscipline(dispatch, [res]);
    } else {
      const res = await disciplineService.updateDiscipline(value.id, value);
      updateDiscipline(dispatch, [res]);
    }
    setIsModalVisible(false);
  };

  return (
    <Modal title="Edit discipline" visible={isModalVisible} onCancel={handleCancel} onOk={saveDiscipline}>
      <Form name="discipline" form={form}>
        <Form.Item key="name" name="name" label="Discipline" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
