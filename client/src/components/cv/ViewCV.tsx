import React, { useState, useCallback, useEffect } from 'react';
import { Layout, Space } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { MainSection, AboutSection, CoursesSection, FeedbackSection } from 'components/cv/sections';
import { Contacts, UserData, CVStudentStats, CVFeedback } from '../../../../common/models/cv';
import { CVService } from '../../services/cv';

const { Content } = Layout;

type Props = {
  ownerGithubId: string;
};

const cvService = new CVService();

function ViewCV(props: Props) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [contactsList, setContactsList] = useState<Contacts | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [courses, setCourses] = useState<CVStudentStats[] | null>(null);
  const [feedback, setFeedback] = useState<CVFeedback[] | null>(null);
  const [expires, setExpires] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { ownerGithubId } = props;

    const cvData = await cvService.getFullCVData(ownerGithubId);

    const {
      notes,
      name,
      selfIntroLink,
      startFrom,
      militaryService,
      avatarLink,
      desiredPosition,
      englishLevel,
      email,
      githubUsername,
      linkedin,
      locations,
      phone,
      skype,
      telegram,
      website,
      fullTime,
      feedback,
      courses,
      expires,
    } = cvData;

    const userData = {
      notes,
      name,
      selfIntroLink,
      militaryService,
      avatarLink,
      desiredPosition,
      englishLevel,
      startFrom,
      fullTime,
    };

    const contactsList = {
      email,
      github: githubUsername,
      linkedin,
      locations,
      phone,
      skype,
      telegram,
      website,
    };

    setContactsList(contactsList);
    setUserData(userData);
    setCourses(courses);
    setFeedback(feedback);
    setExpires(Number(expires));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <LoadingScreen show={isLoading}>
      <Layout className="view-cv-layout" style={{ marginBottom: '15px', width: '960px', backgroundColor: '#FFF' }}>
        <Content>
          <Space direction="vertical" style={{ width: '100%', backgroundColor: '#FFF' }}>
            {userData && contactsList && (
              <>
                <MainSection userData={userData} contacts={contactsList} expires={expires} />
                {userData.notes && <AboutSection notes={userData.notes} />}
              </>
            )}
            {courses?.length ? <CoursesSection courses={courses} /> : ''}
            {feedback && <FeedbackSection feedback={feedback} />}
          </Space>
        </Content>
      </Layout>
    </LoadingScreen>
  );
}

export default ViewCV;
