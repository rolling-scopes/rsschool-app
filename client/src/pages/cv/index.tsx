import * as React from 'react';
import { Layout, Space, Switch } from 'antd';
import { NextRouter, withRouter } from 'next/router';
import withSession, { Session } from 'components/withSession';
import {
  MainSection,
  AboutSection,
  EducationSection,
  EmploymentSection,
  CoursesSection,
  BadgesSection
} from 'components/cv/sections';
import FormCV from 'components/cv/FormCV';
import { mockContactsList, mockUserData, notes, educationHistory, employmentHistory, coursesData, badgesData } from './mockData';
import {EnglishLevel, MilitaryService} from '../../../../common/models/cv';

const { Content } = Layout;

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  isLoading: boolean;
  editMode: boolean;
};

class CVPage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    editMode: true
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
      total: badges.length
    };
  }

  private switchView(checked: boolean) {
    if (checked) {
      this.setState({
        editMode: true
      });
    } else {
      this.setState({
        editMode: false
      });
    }
  }

  render() {
    const {name, desiredPosition, selfIntroLink, englishLevel, militaryService} = mockUserData;
    const { editMode } = this.state;

    const cvData = {
      userData: {
        name,
        desiredPosition,
        selfIntroLink,
        englishLevel: englishLevel as EnglishLevel,
        militaryService: militaryService as MilitaryService,
        notes
      },
      educationHistory,
      employmentHistory,
      contactsList: mockContactsList,
    };

    return (
      <>
        <Layout style={{ paddingTop: '30px', margin: 'auto', maxWidth: '960px' }}>
            <Content>
              <label>
                Switch view:
                <br />
                <Switch defaultChecked={editMode} onChange={this.switchView.bind(this)} checkedChildren='CV view' unCheckedChildren='Form view'/>
              </label>
              {editMode ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <MainSection
                    contacts={mockContactsList}
                    name={name}
                    desiredPosition={desiredPosition}
                    selfIntroLink={selfIntroLink}
                    englishLevel={englishLevel as EnglishLevel}
                    militaryService={militaryService as MilitaryService}
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
                  <BadgesSection
                    badgesData={this.extractBadgesData(badgesData)}
                  />
                </Space>
              ) : (
                <FormCV cvData={cvData} />
              )}
            </Content>
          </Layout>
      </>
    );
  }
}

export default withRouter(withSession(CVPage));
