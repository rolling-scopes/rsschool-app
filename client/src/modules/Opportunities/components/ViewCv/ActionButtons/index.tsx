import { Row, Modal, Button, Divider, Alert, Typography } from 'antd';
import { useCallback } from 'react';
import { useCopyToClipboard } from 'react-use';
import { DeleteOutlined, EditOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useMessage } from 'hooks';

const { Text, Paragraph } = Typography;

const buttonStyle = { width: 'fit-content', margin: '5px' };

type Props = {
  url?: string;
  switchView?: () => void;
  onRemoveConsent?: () => void;
  isExpired: boolean;
};

export const ActionButtons = ({ onRemoveConsent, switchView, url, isExpired }: Props) => {
  const { notification } = useMessage();
  const [, copyToClipboard] = useCopyToClipboard();
  const [modal, contextHolder] = Modal.useModal();

  const showDeletionConfirmationModal = useCallback(() => {
    const title = (
      <>
        <Text strong style={{ fontSize: '18px' }}>
          Delete your CV
        </Text>
        <Divider style={{ marginTop: '5px', marginBottom: '10px' }} />
      </>
    );

    const message =
      "All information from your resume will be permanently deleted. This action won't affect your profile info.";
    const messageRu =
      'Вся информация из резюме будет удалена навсегда. Это действие не повлияет на содержание вашего личного профиля.';
    const confirmationModalContent = (
      <>
        <Alert
          type="warning"
          showIcon
          message={
            <>
              <Paragraph>{message}</Paragraph>
              <Paragraph>{messageRu}</Paragraph>
            </>
          }
        />
        <Paragraph>Are you sure you want to delete your CV? Employers will not be able to access it anymore.</Paragraph>
        <Paragraph>
          Вы уверены, что хотите удалить резюме? Работодатели больше не смогут получить к нему доступ.
        </Paragraph>
        <Divider style={{ marginTop: '10px', marginBottom: '5px' }} />
      </>
    );

    modal.confirm({
      icon: null,
      title: title,
      content: confirmationModalContent,
      centered: true,
      maskClosable: true,
      okText: 'Delete CV',
      okButtonProps: { danger: true },
      onOk: () => onRemoveConsent && onRemoveConsent(),
    });
  }, [onRemoveConsent]);

  return (
    <>
      {contextHolder}
      <Row justify="center" style={{ paddingTop: '10px' }} className="no-print">
        <Button style={buttonStyle} type="primary" htmlType="button" onClick={switchView} icon={<EditOutlined />}>
          Edit CV
        </Button>
        <Button
          disabled={isExpired}
          style={buttonStyle}
          htmlType="button"
          onClick={() => {
            if (url) {
              copyToClipboard(url);
              notification.success({ message: 'Copied to clipboard' });
            }
          }}
          icon={<ShareAltOutlined />}
        >
          Share
        </Button>
        <Button style={buttonStyle} htmlType="button" onClick={showDeletionConfirmationModal} icon={<DeleteOutlined />}>
          Delete
        </Button>
      </Row>
    </>
  );
};
