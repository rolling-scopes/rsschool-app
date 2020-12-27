import * as React from 'react';
import { Layout, Space } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { MainSection, AboutSection, CoursesSection, BadgesSection } from 'components/cv/sections';
import {
  mockContactsList,
  mockUserData,
  educationHistory,
  employmentHistory,
  coursesData,
  badgesData,
} from 'pages/cv/mockData';
import { EnglishLevel, MilitaryService, Contacts, UserData, CourseData } from '../../../../common/models/cv';
import { PublicFeedback } from '../../../../common/models/profile';

const { Content } = Layout;

type State = {
  isLoading: boolean;
  contactsList: Contacts | null;
  userData: UserData | null;
  coursesData: CourseData[] | null;
  badgesData: PublicFeedback[] | null;
};

class ViewCV extends React.Component {
  state: State = {
    isLoading: false,
    contactsList: null,
    userData: null,
    coursesData: null,
    badgesData: null,
  };

  private async fetchData() {
    await this.setState({
      isLoading: true,
    });

    const coursesDataExtracted = this.extractCoursesData(coursesData);

    await this.setState({
      contactsList: mockContactsList,
      userData: mockUserData,
      educationHistory: educationHistory,
      employmentHistory: employmentHistory,
      coursesData: coursesDataExtracted,
      badgesData,
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
    const { avatarLink, name, desiredPosition, selfIntroLink, englishLevel, militaryService, notes } = mockUserData;
    const { isLoading } = this.state;

    return (
      <LoadingScreen show={isLoading}>
        <Layout style={{ paddingTop: '30px', margin: 'auto', maxWidth: '960px' }}>
          <Content>
            <Space direction="vertical" style={{ width: '100%' }}>
              <MainSection
                avatarLink={avatarLink}
                contacts={mockContactsList}
                name={name}
                desiredPosition={desiredPosition}
                selfIntroLink={selfIntroLink}
                englishLevel={englishLevel as EnglishLevel}
                militaryService={militaryService as MilitaryService}
              />
              <AboutSection notes={notes} />
              <CoursesSection coursesData={this.extractCoursesData(coursesData)} />
              <BadgesSection badgesData={badgesData} />
            </Space>
          </Content>
        </Layout>
      </LoadingScreen>
    );
  }
}

export default ViewCV;
