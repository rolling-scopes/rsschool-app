import * as React from 'react';
import { Layout, Space } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import {
  MainSection,
  AboutSection,
/*   EducationSection,
  EmploymentSection, */
  CoursesSection,
  BadgesSection,
} from 'components/cv/sections';
import {
  mockContactsList,
  mockUserData,
  educationHistory,
  employmentHistory,
  coursesData,
  badgesData,
} from 'pages/cv/mockData';
import {
  EnglishLevel,
  MilitaryService,
  Contacts,
  UserData,
  EducationRecord,
  EmploymentRecord,
  CourseData,
  BadgesData,
} from '../../../../common/models/cv';

const { Content } = Layout;

type State = {
  isLoading: boolean;
  contactsList: Contacts | null;
  userData: UserData | null;
  educationHistory: EducationRecord[] | null;
  employmentHistory: EmploymentRecord[] | null;
  coursesData: CourseData[] | null;
  badgesData: BadgesData | null;
};


class ViewCV extends React.Component {
  state: State = {
    isLoading: false,
    contactsList: null,
    userData: null,
    educationHistory: null,
    employmentHistory: null,
    coursesData: null,
    badgesData: null,
  };



  private async fetchData() {
    await this.setState({
      isLoading: true,
    });

    const badgesDataExtracted = this.extractBadgesData(badgesData);
    const coursesDataExtracted = this.extractCoursesData(coursesData);

    await this.setState({
      contactsList: mockContactsList,
      userData: mockUserData,
      educationHistory: educationHistory,
      employmentHistory: employmentHistory,
      coursesData: coursesDataExtracted,
      badgesData: badgesDataExtracted,
    });

    await this.setState({
      isLoading: false,
    });
  }

  private extractCoursesData(coursesData: any) {
    const coursesRaw = coursesData;
    return coursesRaw.map((course: any) => {
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

  private extractBadgesData(badges: any) {
    const uniqueBadgesSummarized = badges.reduce((uniqueBadges: any, badge: any) => {
      const { badgeId } = badge;
      if (uniqueBadges[badgeId]) {
        uniqueBadges[badgeId]++;
      } else {
        uniqueBadges[badgeId] = 1;
      }
      return uniqueBadges;
    }, {} as any);

    const badgesFormatted = Object.entries(uniqueBadgesSummarized).map(entry => {
      const [badgeId, badgeCount] = entry;
      return `${badgeId}: ${badgeCount}`;
    });

    return {
      badges: badgesFormatted,
      total: badges.length,
    };
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
              {/* <EducationSection educationHistory={educationHistory} /> */}
              {/* <EmploymentSection employmentHistory={employmentHistory} /> */}
              <CoursesSection coursesData={this.extractCoursesData(coursesData)} />
              <BadgesSection badgesData={this.extractBadgesData(badgesData)} />
            </Space>
          </Content>
        </Layout>
      </LoadingScreen>
    );
  }
}

export default ViewCV;
