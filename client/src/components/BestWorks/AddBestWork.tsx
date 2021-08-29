import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { IPostBestWork } from '../../services/bestWork';
import { ModalBestWork } from './ModalBestWork';

interface IAddBestWorkProps {
  course: number;
  finishHandler: (values: IPostBestWork, updateWork?: boolean) => Promise<void>;
}

export function AddBestWork({ course, finishHandler }: IAddBestWorkProps) {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const showModal = () => {
    setIsModalVisible(true);
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
      <ModalBestWork
        course={course}
        finishHandler={finishHandler}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      />
    </>
  );
}
