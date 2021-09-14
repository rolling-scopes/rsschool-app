import { Form, Input } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';
import { DisciplineService } from '../../../services/discipline';
import { IDiscipline } from '../model';

const { Item } = Form;

interface IDisciplineForm {
  setIsModalVisible: (arg: boolean) => void;
  discipline?: IDiscipline;
}

export const DisciplineForm = ({ setIsModalVisible, discipline = undefined }: IDisciplineForm) => {
  const disciplineService = useMemo(() => new DisciplineService(), []);
  const [form] = Form.useForm();

  if (!discipline) form.resetFields();

  useEffect(() => {
    if (discipline) {
      form.setFieldsValue(discipline);
    }
  }, [discipline]);

  const saveDiscipline = useCallback(data => {
    if (!discipline?.id) {
      setIsModalVisible(false);
      disciplineService.postDiscipline(data);
      form.resetFields();
    } else {
      setIsModalVisible(false);
      disciplineService.updateDiscipline(discipline.id, data);
      form.resetFields();
    }
  }, []);

  return (
    <Form name="discipline" onFinish={saveDiscipline} form={form}>
      <Item
        name="name"
        label="Discipline"
        rules={[
          {
            required: true,
            message: 'Please input discipline',
          },
        ]}
      >
        <Input />
      </Item>
    </Form>
  );
};
