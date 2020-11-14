import * as React from 'react';
import { Layout, Space } from 'antd';
import { NextRouter, withRouter } from 'next/router';
import withSession, { Session } from 'components/withSession';
import { LoadingScreen } from 'components/LoadingScreen';
import MainSection from 'components/cv/MainSection';
import AboutSection from 'components/cv/AboutSection';
import EducationSection from 'components/cv/EducationSection';
import EmploymentSection from 'components/cv/EmploymentSection';
import CoursesSection from 'components/cv/CoursesSection';
import { mockContactsList, mockUserData, notes, educationHistory, employmentHistory, coursesData } from './mockData';

const { Content } = Layout;

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  isLoading: boolean;
};

class CVPage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
  };

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
        totalScore
      } = course;

      return {
        certificateId,
        courseFullName,
        isExpelled,
        locationName,
        position,
        isCourseCompleted,
        totalScore
      }
    });
  }

  render() {
    return (
      <>
        <LoadingScreen show={this.state.isLoading}>
          <Layout style={{ paddingTop: '30px', margin: 'auto', maxWidth: '960px' }}>
            <Content>
              <Space direction="vertical" style={{ width: '100%' }}>
                <MainSection
                  contacts={mockContactsList}
                  name={mockUserData.name}
                  desiredPosition={mockUserData.desiredPosition}
                />
                <AboutSection
                  notes={notes}
                />
                <EducationSection
                  educationHistory={educationHistory}
                />
                <EmploymentSection
                  employmentHistory={employmentHistory}
                />
                <CoursesSection
                  coursesData={this.extractCoursesData(coursesData)}
                />
              </Space>
            </Content>
          </Layout>
        </LoadingScreen>
      </>
    );
  }
}

export default withRouter(withSession(CVPage));
