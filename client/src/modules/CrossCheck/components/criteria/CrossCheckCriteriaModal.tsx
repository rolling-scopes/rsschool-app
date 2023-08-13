import { Modal } from 'antd';
import { CrossCheckCriteria } from './CrossCheckCriteria';
import { CrossCheckCriteriaDataDto } from 'api';

type Props = {
  modalInfo: CrossCheckCriteriaDataDto[] | null;
  isModalVisible: boolean;
  showModal: (isModalVisible: boolean) => void;
};

export function CrossCheckCriteriaModal({ modalInfo, isModalVisible, showModal }: Props) {
  const handleOk = () => {
    showModal(false);
  };

  const handleCancel = () => {
    showModal(false);
  };

  return (
    <Modal title="Feedback" open={isModalVisible} onOk={handleOk} onCancel={handleCancel} width={1000}>
      <CrossCheckCriteria criteria={modalInfo} />
    </Modal>
  );
}
