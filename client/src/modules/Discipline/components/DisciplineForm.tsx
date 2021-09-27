import { Form, Input } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DisciplineService } from '../../../services/discipline';
import { IDiscipline } from '../model';
import { addDiscipline, updateDiscipline } from '../reducers/actions';
import { useDisciplineContext } from '../contexts/DisciplineContext';

const { Item } = Form;

interface IDisciplineForm {
  setIsModalVisible: (arg: boolean) => void;
  discipline?: IDiscipline;
}

export const DisciplineForm = ({ setIsModalVisible, discipline = undefined }: IDisciplineForm) => {
  const disciplineService = useMemo(() => new DisciplineService(), []);
  const [disciplineName, setDisciplineName] = useState<string>('');
  const [form] = Form.useForm();
  const { disciplines, dispatch } = useDisciplineContext();

  if (!discipline) form.resetFields();

  useEffect(() => {
    if (discipline) {
      form.setFieldsValue(discipline);
    }
  }, [discipline]);

  const saveDiscipline = useCallback(async data => {
    if (!discipline?.id) {
      setIsModalVisible(false);
      const res = await disciplineService.postDiscipline(data);
      form.resetFields();
      addDiscipline(dispatch, [res]);
    } else {
      setIsModalVisible(false);
      const res = await disciplineService.updateDiscipline(discipline.id, data);
      form.resetFields();
      updateDiscipline(dispatch, [res]);
    }
  }, [setIsModalVisible, discipline]);

  const validateName = useCallback((name: string): boolean => {
    let isRightName = true;
    if (disciplines.some(d => d.name === name)) {
      isRightName = false;
    }
    return isRightName;
  }, [disciplines]);

  return (
    <Form name='discipline' onFinish={saveDiscipline} form={form}>
      <Item
        name='name'
        label='Discipline'
        rules={[
          {
            required: true,
            message: 'Please input discipline',
          },
        ]}
        validateStatus={validateName(disciplineName) ? 'success' : 'error'}
        help={!validateName(disciplineName) && 'Discipline is already exist'}
      >
        <Input onChange={(e) => setDisciplineName(e.target.value)} />
      </Item>
    </Form>
  );
};
