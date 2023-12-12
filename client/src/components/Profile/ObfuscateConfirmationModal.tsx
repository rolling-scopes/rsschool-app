import { useState } from 'react';
import { Modal, Input, Typography, Space } from 'antd';
import { ProfileApi } from 'api';

const { Text, Paragraph } = Typography;

type Props = {
  githubId: string | null;
  setIsModalVisible: (value: boolean) => void;
  open: boolean;
};

const profileApi = new ProfileApi();

const ObfuscationModal = ({ githubId, setIsModalVisible, open }: Props) => {
  const [inputValue, setInputValue] = useState('');
  const [isInputValid, setIsInputValid] = useState(true);

  const handleOk = async () => {
    if (githubId && inputValue === githubId) {
      await profileApi.obfuscateProfile(githubId);
      window.location.reload();
    } else {
      setIsInputValid(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setInputValue('');
    setIsInputValid(true);
  };

  return (
    <Modal open={open} title="Confirm GitHub Profile Obfuscation" onOk={handleOk} onCancel={handleCancel}>
      <Space direction="vertical">
        <Paragraph>
          <Text>
            Please type the GitHub nickname <Text strong>"{githubId}"</Text> to confirm obfuscation.
          </Text>
        </Paragraph>
        <Paragraph type="warning">
          <Text strong type="danger">
            Warning:
          </Text>{' '}
          Once initiated, the obfuscation process cannot be canceled. Upon completion, all user data will be permanently
          deleted and this action is irreversible. Please verify the GitHub nickname and proceed with extreme caution.
        </Paragraph>
        <Input
          placeholder="Enter GitHub nickname"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value);
            setIsInputValid(true);
          }}
          status={isInputValid ? '' : 'error'}
        />
        {!isInputValid && <Text type="danger">Nickname does not match. Please try again.</Text>}
      </Space>
    </Modal>
  );
};

export default ObfuscationModal;
