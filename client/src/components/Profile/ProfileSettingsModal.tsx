import { Modal } from 'antd';

import styles from './ProfileSettingsModal.module.css';

type Props = {
  isSettingsVisible: boolean;
  content: JSX.Element;
  settingsTitle?: string;
  isLoading?: boolean;
  isSaveDisabled?: boolean;
  onSave: () => void;
  onCancel?: () => void;
};

const ProfileSettingsModal = ({
  isSettingsVisible,
  content,
  settingsTitle,
  onSave,
  onCancel,
  isLoading = false,
  isSaveDisabled = false,
}: Props) => {
  return (
    <Modal
      title={settingsTitle ?? 'Profile information'}
      open={isSettingsVisible}
      okText="Save"
      onOk={onSave}
      okButtonProps={{ disabled: isSaveDisabled }}
      onCancel={onCancel}
      confirmLoading={isLoading}
      centered
      className={styles.modal}
    >
      {content}
    </Modal>
  );
};

export default ProfileSettingsModal;
