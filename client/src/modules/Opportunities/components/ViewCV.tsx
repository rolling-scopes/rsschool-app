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
        <Row style={{ minHeight: '100vh', padding: 10 }}>
          <Col xl={8} lg={8} md={8} sm={8} xs={24} className="cv-sidebar">
            <Row>
              <NameTitle userData={userData} />
            </Row>
            <Row>
              <PersonalSection user={userData} />
            </Row>
            <Row>
              <ContactsSection contacts={contacts} />
            </Row>
          </Col>
          <Col xl={16} lg={16} md={16} sm={16} xs={24}>
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
