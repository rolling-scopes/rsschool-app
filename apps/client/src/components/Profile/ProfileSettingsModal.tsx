import { Modal } from 'antd';

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
    >
      {content}
      <style jsx>
        {`
          :global(.ant-modal-content) {
            height: inherit !important;
          }

          :global(.ant-modal-body) {
            max-height: calc(90vh - 80px);
            overflow-y: auto;
          }
        `}
      </style>
    </Modal>
  );
};

export default ProfileSettingsModal;
