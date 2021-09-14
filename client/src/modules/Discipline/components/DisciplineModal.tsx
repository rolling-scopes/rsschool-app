import { Button, Modal } from 'antd';
import { DisciplineForm } from './DisciplineForm';
import { IDiscipline } from '../model';

interface IDisciplineModal {
  isModalVisible: boolean;
  setIsModalVisible: (arg: boolean) => void;
  discipline?: IDiscipline;
}

export const DisciplineModal = ({ isModalVisible, setIsModalVisible, discipline }: IDisciplineModal) => {
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Modal
      title="Edit discipline"
      visible={isModalVisible}
      onCancel={handleCancel}
      footer={[
        <Button onClick={handleCancel} key="cancel">
          Cancel
        </Button>,
        <Button form="discipline" key="submit" htmlType="submit" type="primary">
          Save
        </Button>,
      ]}
    >
      <DisciplineForm setIsModalVisible={setIsModalVisible} discipline={discipline} />
    </Modal>
  );
};
