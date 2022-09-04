import { Col, Row, Typography, Modal, Button, notification } from 'antd';
import React, { useEffect, useCallback, useState, CSSProperties } from 'react';
import { useCopyToClipboard } from 'react-use';
import moment from 'moment';
import {
  ExclamationCircleTwoTone,
  QuestionCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ShareAltOutlined,
  CloseCircleTwoTone,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { ResumeDto } from 'api';
import { OpportunitiesService } from 'modules/Opportunities/services/opportunities';
import { LoadingScreen } from 'components/LoadingScreen';
import { useViewData } from '../hooks/useViewData';
import AboutSection from './AboutSection';
import { ContactsSection } from './ContactsSection';
import { CoursesSection } from './CoursesSection';
import { FeedbackSection } from './FeedbackSection';
import { GratitudeSection } from './GratitudeSection';
import { NameTitle } from './NameTitle';
import { PersonalSection } from './PersonalSection';
import { PublicLink } from './PublicLink';

const { Title, Text, Paragraph } = Typography;

type Props = {
  initialData: ResumeDto;
  onRemoveConsent?: () => void;
  switchView?: () => void;
  publicMode?: boolean;
};

const oldService = new OpportunitiesService();

const buttonStyle = { width: 'fit-content', margin: '5px' };

type ActionButtonsProps = {
  url?: string;
  switchView?: () => void;
  onRemoveConsent?: () => void;
  isExpired: boolean;
};

const ActionButtons = ({ onRemoveConsent, switchView, url, isExpired }: ActionButtonsProps) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const showDeletionConfirmationModal = useCallback(() => {
    const textStyle: CSSProperties = { textAlign: 'center' };

    const title = (
      <Title level={3} style={{ textAlign: 'center' }}>
        <ExclamationCircleTwoTone twoToneColor="#d60000" /> <Text strong>Deleting CV</Text>
      </Title>
    );

    const message =
      'Are you sure you want to delete your CV? The information contained therein will be deleted and employers will not be able to access it.';
    const messageRu =
      'Вы уверены, что хотите удалить свое резюме? Информация, содержащаяся в нем, будет удалена, а работодатели не смогут получить к нему доступ.';
    const confirmationModalContent = (
      <>
        <Paragraph style={textStyle}>{message}</Paragraph>
        <Paragraph style={textStyle}>{messageRu}</Paragraph>
      </>
    );

    Modal.confirm({
      icon: null,
      title,
      content: confirmationModalContent,
      centered: true,
      maskClosable: true,
      okText: 'Delete my CV',
      onOk: () => onRemoveConsent && onRemoveConsent(),
    });
  }, [onRemoveConsent]);

  return (
    <Row justify="center" style={{ paddingTop: '10px' }}>
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
  );
};

const enum ExpirationState {
  Expired,
  NearlyExpired,
  NotExpired,
}

const ExpirationTooltip = ({
  expirationDate,
  expirationState,
}: {
  expirationDate: string;
  expirationState: ExpirationState;
}) => {
  const textStyle = { fontSize: '12px' };

  const showRenewModal = () => {
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
        await oldService.updateResume();
        notification.success({
          message: 'CV successfully renewed',
          placement: 'topRight',
          closeIcon: ' ',
          duration: 2,
        });
      },
    });
  };

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

const useExpiration = (expires: string) => {
  const expirationDate = moment(Number(expires));
  const expirationDateFormatted = expirationDate.format('YYYY-MM-DD');
  const diff = expirationDate.diff(Date.now());
  const daysLeft = moment.duration(diff).asDays();
  const expirationState =
    daysLeft < 0 ? ExpirationState.Expired : daysLeft < 2 ? ExpirationState.NearlyExpired : ExpirationState.NotExpired;

  return {
    expirationDateFormatted,
    expirationState,
  };
};

function ViewCV({ initialData, publicMode, onRemoveConsent, switchView }: Props) {
  const { loading, uuid, userData, contacts, courses, feedbacks, gratitudes, expires } = useViewData({ initialData });
  const { expirationState, expirationDateFormatted } = useExpiration(expires as unknown as string);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${window.location.origin}/cv/${uuid}`);
  }, [uuid]);

  return (
    <LoadingScreen show={loading}>
      {publicMode ? (
        <PublicLink url={url} />
      ) : (
        <ActionButtons
          onRemoveConsent={onRemoveConsent}
          switchView={switchView}
          url={url}
          isExpired={expirationState === ExpirationState.Expired}
        />
      )}
      {userData && (
        <Row className="print-no-padding" style={{ minHeight: '100vh', minWidth: '300px', padding: 10 }}>
          <Col xl={8} lg={8} md={10} sm={24} xs={24} className="cv-sidebar">
            <Row justify="space-between">
              <ExpirationTooltip expirationDate={expirationDateFormatted} expirationState={expirationState} />
            </Row>
            <Row>
              <NameTitle userData={userData} />
            </Row>
            <Row gutter={24}>
              <Col xs={12} sm={12} md={24} lg={24} style={{ marginTop: 16 }}>
                <PersonalSection user={userData} />
              </Col>
              <Col xs={12} sm={12} md={24} lg={24} style={{ marginTop: 16 }}>
                <ContactsSection contacts={contacts} />
              </Col>
            </Row>
          </Col>
          <Col xl={16} lg={16} md={14} sm={24} xs={24}>
            <AboutSection notes={userData.notes} />
            <CoursesSection visibleCourses={initialData.visibleCourses} courses={courses ?? []} />
            <FeedbackSection data={feedbacks} />
            <GratitudeSection data={gratitudes} />
          </Col>
        </Row>
      )}
    </LoadingScreen>
  );
}

export default ViewCV;
