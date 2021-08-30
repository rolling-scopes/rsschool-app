import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { BestWorkModal } from './BestWorkModal';
import { Course } from '../../../services/models';
import { IPostBestWork } from '../interfaces';

interface IAddBestWorkProps {
  courses: Course[];
  finishHandler: (values: IPostBestWork, updateWork?: boolean) => Promise<void>;
}

export function BestWorkAdd({ courses, finishHandler }: IAddBestWorkProps) {
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
        style={{ position: 'fixed', bottom: '50px', right: '50px', zIndex: 10 }}
        size={'large'}
        onClick={showModal}
      />
      <BestWorkModal
        courses={courses}
        finishHandler={finishHandler}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      />
    </>
  );
}
