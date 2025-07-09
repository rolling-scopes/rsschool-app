import { Col, Divider, Row } from 'antd';
import { useEffect, useState } from 'react';
import { ResumeDto } from 'api';
import { LoadingScreen } from 'components/LoadingScreen';
import { useExpiration, useViewData } from 'modules/Opportunities/hooks';
import { ExpirationTooltip } from 'modules/Opportunities/components/ExpirationTooltip';
import { ExpirationState } from 'modules/Opportunities/constants';
import { AboutSection } from './AboutSection';
import { ContactsSection } from './ContactsSection';
import { CoursesSection } from './CoursesSection';
import { FeedbackSection } from './FeedbackSection';
import { GratitudeSection } from './GratitudeSection';
import { PersonalSection } from './PersonalSection';
import { NameTitle } from '../NameTitle';
import { PublicLink } from '../PublicLink';
import { ActionButtons } from './ActionButtons';

type Props = {
  initialData: ResumeDto;
  onRemoveConsent?: () => void;
  switchView?: () => void;
  publicMode?: boolean;
};

export const ViewCV = ({ initialData, publicMode, onRemoveConsent, switchView }: Props) => {
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
              <ExpirationTooltip
                publicMode={publicMode}
                expirationDate={expirationDateFormatted}
                expirationState={expirationState}
              />
            </Row>
            <Row>
              <NameTitle userData={userData} />
            </Row>
            <Divider style={{ margin: '8px 0', backgroundColor: '#262626' }} />
            <Row gutter={24}>
              <Col xs={12} sm={12} md={24} lg={24} style={{ marginTop: 16 }}>
                <PersonalSection user={userData} />
              </Col>
              <Divider
                style={{
                  margin: '8px 0',
                  backgroundColor: '#262626',
                }}
              />
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
};
