import * as React from 'react';
import { Layout, Space } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { MainSection, AboutSection, CoursesSection, FeedbackSection } from 'components/CV/sections';
import { Contacts, UserData, CourseData } from '../../../../common/models/cv';
import { PublicFeedback } from '../../../../common/models/profile';
import { UserService } from 'services/user';
import {badgesData as publicFeedback, coursesData} from '../../pages/cv/mockData';

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
};

class ViewCV extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    contactsList: null,
    userData: null,
    coursesData: null,
    publicFeedback: null,
  };

  private userService = new UserService();

  private async fetchData() {
    const { ownerId } = this.props;
    await this.setState({
      isLoading: true,
    });

    const profile = await this.userService.getProfileInfo(ownerId);

    //const coursesData = profile.studentStats;
    //const publicFeedback = profile.publicFeedback ? profile.publicFeedback : null;
    const opportunitiesInfo = await this.userService.getOpportunitiesInfo(ownerId);

    const { notes, name, selfIntroLink, startFrom, militaryService, avatarLink, desiredPosition, englishLevel, email, github, linkedin, location, phone, skype, telegram, website, fullTime } = opportunitiesInfo;

    const userData = {
      notes,
      name,
      selfIntroLink,
      militaryService,
      avatarLink,
      desiredPosition,
      englishLevel,
      startFrom,
      fullTime
    };

    const contactsList = {
      email,
      github,
      linkedin,
      location,
      phone,
      skype,
      telegram,
      website
    };

    const coursesDataExtracted = this.extractCoursesData(coursesData);

    await this.setState({
      contactsList: contactsList as Contacts,
      userData: userData as UserData,
      coursesData: coursesDataExtracted,
      publicFeedback,
    });

    await this.setState({
      isLoading: false,
    });
  }

  private extractCoursesData(coursesData: any) {
    return coursesData.map((course: any) => {
      const {
        certificateId,
        courseFullName,
        isExpelled,
        locationName,
        position,
        isCourseCompleted,
        totalScore,
      } = course;

      return {
        certificateId,
        courseFullName,
        isExpelled,
        locationName,
        position,
        isCourseCompleted,
        totalScore,
      };
    });
  }

  async componentDidMount() {
    await this.fetchData();
  }

  render() {

    const { isLoading, userData, contactsList, coursesData, publicFeedback } = this.state;

    return (
      <LoadingScreen show={isLoading}>
        <Layout style={{ marginBottom: '15px', maxWidth: '960px', backgroundColor: '#FFF', border: '1px solid black' }}>
          <Content>
            <Space direction="vertical" style={{ width: '100%', backgroundColor: '#FFF' }}>
              {userData && contactsList && (
              <>
              <MainSection
                avatarLink={userData.avatarLink}
                contacts={contactsList as Contacts}
                name={userData.name}
                desiredPosition={userData.desiredPosition}
                selfIntroLink={userData.selfIntroLink}
                englishLevel={userData.englishLevel}
                militaryService={userData.militaryService}
                startFrom={userData.startFrom}
                fullTime={userData.fullTime}
              />
              {userData.notes &&<AboutSection notes={userData.notes} />}
              </>)}
              {coursesData?.length ? <CoursesSection coursesData={coursesData} /> : ''}
              {publicFeedback && <FeedbackSection feedback={publicFeedback} />}
            </Space>
          </Content>
        </Layout>
      </LoadingScreen>
    );
  }
}

export default ViewCV;
