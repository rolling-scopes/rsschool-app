import { Col, Row, Typography, Modal, Button } from 'antd';
import React, { useEffect, useCallback, useState, CSSProperties } from 'react';
import { useCopyToClipboard } from 'react-use';
import { ExclamationCircleTwoTone, DeleteOutlined, EditOutlined, ShareAltOutlined } from '@ant-design/icons';
import { ResumeDto } from 'api';
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

const buttonStyle = { width: 'fit-content', margin: '5px' };

type ActionButtonsProps = {
  url?: string;
  switchView?: () => void;
  onRemoveConsent?: () => void;
};

const ActionButtons = ({ onRemoveConsent, switchView, url }: ActionButtonsProps) => {
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
        style={buttonStyle}
        htmlType="button"
        onClick={() => url && copyToClipboard(url)}
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

function ViewCV({ initialData, publicMode, onRemoveConsent, switchView }: Props) {
  const { loading, uuid, userData, contacts, courses, feedbacks, gratitudes } = useViewData({ initialData });
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${window.location.origin}/cv/${uuid}`);
  }, [uuid]);

  return (
    <LoadingScreen show={loading}>
      {publicMode ? (
        <PublicLink url={url} />
      ) : (
        <ActionButtons onRemoveConsent={onRemoveConsent} switchView={switchView} url={url} />
      )}
      {userData && (
        <Row className="print-no-padding" style={{ minHeight: '100vh', padding: 10 }}>
          <Col xl={8} lg={8} md={10} sm={24} xs={24} className="cv-sidebar">
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
