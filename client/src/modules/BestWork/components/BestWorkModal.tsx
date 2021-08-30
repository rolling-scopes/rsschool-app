import { Button, Modal } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { Course } from '../../../services/models';
import { BestWorkForm } from './BestWorkForm';
import { IBestWork, IPostBestWork } from '../interfaces';

export interface IModalAddBestWorkProps {
  courses: Course[];
  isModalVisible: boolean;
  finishHandler: (values: IPostBestWork) => Promise<void>;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
  work?: IBestWork;
}

export function BestWorkModal({
  courses,
  finishHandler,
  isModalVisible,
  setIsModalVisible,
  work,
}: IModalAddBestWorkProps) {
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Modal
      title="Basic Modal"
      visible={isModalVisible}
      onCancel={handleCancel}
      footer={[
        <Button onClick={handleCancel} key="cancel">
          Cancel
        </Button>,
        <Button form="addBestWorkForm" key="submit" htmlType="submit" type="primary">
          Save
        </Button>,
      ]}
    >
      <BestWorkForm work={work} courses={courses} setIsModalVisible={setIsModalVisible} finishHandler={finishHandler} />
    </Modal>
  );
}
