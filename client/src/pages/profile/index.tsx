import * as React from 'react';
import {
  Result,
  Button,
} from 'antd';
import css from 'styled-jsx/css';
import Masonry from 'react-masonry-css';
import { Header } from 'components/Header';
import { NextRouter, withRouter } from 'next/router';
import { LoadingScreen } from 'components/LoadingScreen';
import withSession, { Session } from 'components/withSession';
import { UserService } from 'services/user';
import { ProfileInfo, StudentStats } from '../../../../common/models/profile';

import MainCard from 'components/Profile/MainCard';
import AboutCard from 'components/Profile/AboutCard';
import EnglishCard from 'components/Profile/EnglishCard';
import EducationCard from 'components/Profile/EducationCard';
import ContactsCard from 'components/Profile/ContactsCard';
import PublicFeedbackCard from 'components/Profile/PublicFeedbackCard';
import StudentStatsCard from 'components/Profile/StudentStatsCard';
import MentorStatsCard from 'components/Profile/MentorStatsCard';
import CoreJsIviewsCard from 'components/Profile/CoreJsIviewsCard';
import { CoreJsInterviewData } from 'components/Profile/CoreJsIviewsCard';
import PreScreeningIviewCard from 'components/Profile/PreScreeningIviewCard';

import {
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  isEditingModeEnabled: boolean;
  profile: ProfileInfo | null;
  isLoading: boolean;
};

class ProfilePage extends React.Component<Props, State> {
  state: State = {
    isEditingModeEnabled: false,
    isLoading: true,
    profile: null,
  };

  private userService = new UserService();

  private hadStudentCoreJSInterview = (stats: StudentStats[]) => stats
    .some((student: StudentStats) => student.tasks
    .some(({ interviewFormAnswers }) => interviewFormAnswers));

  private getStudentCoreJSInterviews = (stats: StudentStats[]) => stats
    .filter((student: StudentStats) => student.tasks
    .some(({ interviewFormAnswers }) => interviewFormAnswers))
    .map(({ tasks, courseFullName, courseName, locationName }) => ({
      courseFullName,
      courseName,
      locationName,
      interview: tasks
        .filter(({ interviewFormAnswers }) => interviewFormAnswers)
        .map(({ interviewFormAnswers, score, comment, interviewer }) => ({
          score,
          comment,
          interviewer,
          answers: interviewFormAnswers,
        }))[0],
    })) as CoreJsInterviewData[];

  private fetchData = async () => {
    this.setState({ isLoading: true });

    const { router } = this.props;

    try {
      const githubId = router.query ? (router.query.githubId as string) : '';
      const profile = await this.userService.getProfileInfo(githubId);

      console.log(profile);

      this.setState({ isLoading: false, profile });
    } catch (e) {
      this.setState({ isLoading: false, profile: null });
    }
  };

  private toggleEditViewProfileButton = () => {
    const { isEditingModeEnabled } = this.state;

    this.setState({ isEditingModeEnabled: !isEditingModeEnabled });
  }

  async componentDidMount() {
    await this.fetchData();
  }

  async componentDidUpdate(prevProps: { router: { query?: any } }) {
    if (prevProps.router.query.githubId !== this.props.router.query!.githubId) {
      await this.fetchData();
    }
  }

  render() {
    const { profile, isEditingModeEnabled } = this.state;

    const cards = [
      profile?.generalInfo &&
        <MainCard data={profile.generalInfo} isEditingModeEnabled={isEditingModeEnabled}/>,
      profile?.generalInfo?.aboutMyself &&
        <AboutCard data={profile.generalInfo} isEditingModeEnabled={isEditingModeEnabled}/>,
      profile?.generalInfo?.englishLevel &&
        <EnglishCard data={profile.generalInfo} isEditingModeEnabled={isEditingModeEnabled}/>,
      profile?.generalInfo?.educationHistory?.length &&
        <EducationCard data={profile.generalInfo} isEditingModeEnabled={isEditingModeEnabled}/>,
      profile?.contacts &&
        <ContactsCard data={profile.contacts} isEditingModeEnabled={isEditingModeEnabled}/>,
      profile?.publicFeedback?.length &&
        <PublicFeedbackCard data={profile.publicFeedback} isEditingModeEnabled={isEditingModeEnabled}/>,
      profile?.studentStats?.length &&
        <StudentStatsCard data={profile.studentStats} isEditingModeEnabled={isEditingModeEnabled}/>,
      profile?.mentorStats?.length &&
        <MentorStatsCard data={profile.mentorStats} isEditingModeEnabled={isEditingModeEnabled}/>,
      profile?.studentStats?.length && this.hadStudentCoreJSInterview(profile.studentStats) &&
        <CoreJsIviewsCard data={this.getStudentCoreJSInterviews(profile.studentStats)}/>,
      profile?.stageInterviewFeedback.length &&
        <PreScreeningIviewCard data={profile.stageInterviewFeedback}/>,
    ].filter(Boolean) as JSX.Element[];

    return (
      <>
        <LoadingScreen show={this.state.isLoading}>
          <Header username={this.props.session.githubId} />
          {
            this.state.profile
              ? <div style={{ padding: 10 }}>
                  <Button
                    type="ghost"
                    style={{ position: 'fixed', width: 80, right: 10, zIndex: 1 }}
                    onClick={this.toggleEditViewProfileButton}
                  >
                  {
                    isEditingModeEnabled ?
                      <span><EditOutlined/> Edit</span> :
                      <span><EyeOutlined /> View</span>
                  }
                  </Button>
                  <Masonry
                    breakpointCols={{
                      default: 4,
                      1100: 3,
                      700: 2,
                      500: 1,
                    }}
                    className={masonryClassName}
                    columnClassName={masonryColumnClassName}
                  >
                    {cards.map((card, idx) => (
                      <div style={{ marginBottom: gapSize }} key={`card-${idx}`}>
                        {card}
                      </div>
                      ),
                    )}
                  </Masonry>
                  {masonryStyles}
                  {masonryColumnStyles}
              </div>
              : <>
                <Result status="403" title="No access or user does not exist" />
              </>
          }
        </LoadingScreen>
      </>
    );
  }
}

const gapSize = 16;
const { className: masonryClassName, styles: masonryStyles } = css.resolve`
  div {
    display: flex;
    margin-left: -${gapSize}px;
    width: auto;
  }
`;
const { className: masonryColumnClassName, styles: masonryColumnStyles } = css.resolve`
  div {
    padding-left: ${gapSize}px;
    background-clip: padding-box;
  }
`;

export default withRouter(withSession(ProfilePage));
