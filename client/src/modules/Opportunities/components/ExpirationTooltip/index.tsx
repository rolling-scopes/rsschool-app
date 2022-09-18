import { Typography, Button, Modal, notification } from 'antd';
import { useCallback } from 'react';
import { useEffectOnce } from 'react-use';
import {
  ExclamationCircleTwoTone,
  QuestionCircleOutlined,
  CloseCircleTwoTone,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { ExpirationState } from 'modules/Opportunities/constants';
import { OpportunitiesService } from 'modules/Opportunities/services/opportunities';

const { Text, Paragraph } = Typography;

const service = new OpportunitiesService();

export const ExpirationTooltip = ({
  expirationDate,
  expirationState,
}: {
  expirationDate: string;
  expirationState: ExpirationState;
}) => {
  const textStyle = { fontSize: '12px' };

  useEffectOnce(() => {
    if (expirationState === ExpirationState.Expired) showRenewModal();
  });

  const showRenewModal = useCallback(() => {
    const title =
      expirationState === ExpirationState.NotExpired ? (
        <Text strong>Your CV is public until {expirationDate}</Text>
      ) : expirationState === ExpirationState.NearlyExpired ? (
        <Text strong>Your CV will expire in 2 days on {expirationDate}</Text>
      ) : (
        <Text strong>Your CV is archived</Text>
      );
    const content =
      expirationState === ExpirationState.Expired ? (
        <Paragraph>You need to renew your resume to make it visible to other users again.</Paragraph>
      ) : (
        <Paragraph>
          If you won't renew your CV until this date, it will get archived and will not be visible to other users of RS
          App.
        </Paragraph>
      );
    const icon =
      expirationState === ExpirationState.NotExpired ? (
        <ExclamationCircleTwoTone twoToneColor="#1890FF" />
      ) : expirationState === ExpirationState.Expired ? (
        <CloseCircleTwoTone twoToneColor="#FF4D4F" />
      ) : (
        <ExclamationCircleTwoTone twoToneColor="#FFA940" />
      );

    Modal.confirm({
      icon,
      title,
      content,
      okText: (
        <span>
          <ClockCircleOutlined /> Renew
        </span>
      ),
      maskClosable: true,
      onOk: async () => {
        await service.updateResume();
        notification.success({
          message: 'CV successfully renewed',
          placement: 'topRight',
          closeIcon: ' ',
          duration: 2,
        });
      },
    });
  }, [expirationDate, expirationState]);

  const PublicButton = () => (
    <Button
      size="small"
      onClick={showRenewModal}
      style={{ backgroundColor: '#F6FFED', color: '#52C41A', borderColor: '#B7EB8F' }}
    >
      Public
    </Button>
  );

  const ArchivedButton = () => (
    <Button
      size="small"
      onClick={showRenewModal}
      style={{ backgroundColor: '#FFF1F0', color: '#F5222D', borderColor: '#FFA39E' }}
    >
      Archived
    </Button>
  );

  const expiredContent = (
    <>
      <Text style={{ ...textStyle, color: '#FF4D4F' }}>
        Expired on {expirationDate} <QuestionCircleOutlined />
      </Text>{' '}
      <ArchivedButton />
    </>
  );

  const nearlyExpiredContent = (
    <>
      <Text style={{ ...textStyle, color: '#FAAD14' }}>
        Expires on {expirationDate} <QuestionCircleOutlined />
      </Text>{' '}
      <PublicButton />
    </>
  );

  const notExpiredContent = (
    <>
      <Text style={{ ...textStyle, color: '#FFFFFF' }}>
        Expires on {expirationDate} <QuestionCircleOutlined />
      </Text>{' '}
      <PublicButton />
    </>
  );

  switch (expirationState) {
    case ExpirationState.Expired:
      return expiredContent;

    case ExpirationState.NearlyExpired:
      return nearlyExpiredContent;

    case ExpirationState.NotExpired:
      return notExpiredContent;

    default:
      return null;
  }
};
