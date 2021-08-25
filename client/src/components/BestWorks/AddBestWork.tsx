import { Button, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { BestWorkService } from '../../services/bestWork';
import { CourseTask } from '../../services/course';
import { ModalAddBestWork } from './ModalAddBestWork';

interface IAddBestWorkProps {
  course: number;
  tasks: CourseTask[];
}

export interface IForm {
  githubId: string[];
  task: number;
  imageUrl: string;
  tags: string[];
}

export function AddBestWork({ course, tasks }: IAddBestWorkProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const bestWorkService = useMemo(() => new BestWorkService(), []);

  const [form] = Form.useForm();

  const onFinish = async (values: IForm) => {
    const result = await bestWorkService.postBestWork({ ...values, course });
    form.resetFields();
    setIsModalVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        icon={<PlusOutlined />}
        style={{ position: 'fixed', bottom: '50px', right: '50px' }}
        size={'large'}
        onClick={showModal}
      />
      <ModalAddBestWork
        visible={isModalVisible}
        onFinish={onFinish}
        handleCancel={handleCancel}
        tasks={tasks}
        form={form}
      />
    </>
  );
}
