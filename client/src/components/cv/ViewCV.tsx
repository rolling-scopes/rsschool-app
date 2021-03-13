import React, { useState, useCallback, useEffect } from 'react';
import { Layout, Space } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { MainSection, AboutSection, CoursesSection, FeedbackSection } from 'components/cv/sections';
import { Contacts, UserData, CourseData, GetCVData } from '../../../../common/models/cv';
import { PublicFeedback } from '../../../../common/models/profile';
import { UserService } from 'services/user';

const { Content } = Layout;

type Props = {
  ownerId: string;
};

type State = {
  isLoading: boolean;
  contactsList: Contacts | null;
  userData: UserData | null;
  coursesData: CourseData[] | null;
  publicFeedback: PublicFeedback[] | null;
  expires: number | null;
};

const userService = new UserService();

const extractCoursesData = (coursesData: any) => {
  return coursesData.map((course: any) => {
    const {
      certificateId,
      courseFullName,
      isExpelled,
      locationName,
      position,
      isCourseCompleted,
      totalScore,
      mentor,
    } = course;

    return {
      certificateId,
      courseFullName,
      isExpelled,
      locationName,
      position,
      isCourseCompleted,
      totalScore,
      mentor,
    };
  });
};

function ViewCV(props: Props) {

  const [state, setState] = useState<State>({
    isLoading: false,
    contactsList: null,
    userData: null,
    coursesData: null,
    publicFeedback: null,
    expires: null
  });

  const fetchData = useCallback(async () => {
    const { ownerId } = props;

    await setState({
      ...state,
      isLoading: true
    });

    const cvData: GetCVData = await userService.getCVData(ownerId);

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
      github,
      linkedin,
      location,
      phone,
      skype,
      telegram,
      website,
      fullTime,
      publicFeedback,
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
      github,
      linkedin,
      location,
      phone,
      skype,
      telegram,
      website,
    };

    const coursesDataExtracted = extractCoursesData(courses);

    await setState({
      contactsList,
      userData,
      coursesData: coursesDataExtracted,
      publicFeedback,
      expires: Number(expiresRaw),
      isLoading: false
    });

  }, []);



  useEffect(() => {
    fetchData();
  }, [])

  const { isLoading, userData, contactsList, coursesData, publicFeedback, expires } = state;

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
            {coursesData?.length ? <CoursesSection coursesData={coursesData} /> : ''}
            {publicFeedback && <FeedbackSection feedback={publicFeedback} />}
          </Space>
        </Content>
      </Layout>
    </LoadingScreen>
  );
}

export default ViewCV;
