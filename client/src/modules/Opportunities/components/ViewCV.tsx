import { Col, Row } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import React from 'react';
import { useViewData } from '../hooks/useViewData';
import AboutSection from './AboutSection';
import { ContactsSection } from './ContactsSection';
import { CoursesSection } from './CoursesSection';
import { FeedbackSection } from './FeedbackSection';
import { NameTitle } from './NameTitle';
import { PersonalSection } from './PersonalSection';

type Props = {
  ownerGithubId: string;
};

function ViewCV({ ownerGithubId }: Props) {
  const { loading, userData, contacts, courses, feedback } = useViewData({ githubId: ownerGithubId });

  return (
    <LoadingScreen show={loading}>
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
            <CoursesSection courses={courses ?? []} />
            <FeedbackSection feedback={feedback} />
          </Col>
        </Row>
      )}
    </LoadingScreen>
  );
}

export default ViewCV;
