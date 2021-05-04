import React, { useState, useCallback, useEffect } from 'react';
import { Layout, Space } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { MainSection, AboutSection, CoursesSection, FeedbackSection } from 'components/cv/sections';
import { Contacts, UserData, GetCVData, CVStudentStats, CVFeedback } from '../../../../common/models/cv';
import { CVService } from '../../services/cv';

const { Content } = Layout;

type Props = {
  ownerGithubId: string;
};

type State = {
  isLoading: boolean;
  contactsList: Contacts | null;
  userData: UserData | null;
  courses: CVStudentStats[] | null;
  feedback: CVFeedback[] | null;
  expires: number | null;
};

const cvService = new CVService();

function ViewCV(props: Props) {
  const [state, setState] = useState<State>({
    isLoading: false,
    contactsList: null,
    userData: null,
    courses: null,
    feedback: null,
    expires: null,
  });

  const fetchData = useCallback(async () => {
    const { ownerGithubId } = props;

    await setState({
      ...state,
      isLoading: true,
    });

    const cvData: GetCVData = await cvService.getCVData(ownerGithubId);

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
      location,
      phone,
      skype,
      telegram,
      website,
      fullTime,
      feedback,
      courses,
      expires: expiresRaw,
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
      location,
      phone,
      skype,
      telegram,
      website,
    };

    await setState({
      contactsList,
      userData,
      courses,
      feedback,
      expires: Number(expiresRaw),
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const { isLoading, userData, contactsList, courses, feedback, expires } = state;

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
