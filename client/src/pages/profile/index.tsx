import * as React from 'react';
import { get, set, isEqual, cloneDeep, mapValues, clone } from 'lodash';
import {
  Result,
  Spin,
  message,
} from 'antd';
import css from 'styled-jsx/css';
import Masonry from 'react-masonry-css';
import { Header } from 'components/Header';
import { NextRouter, withRouter } from 'next/router';
import { LoadingScreen } from 'components/LoadingScreen';
import withSession, { Session } from 'components/withSession';
import { UserService } from 'services/user';
import { ProfileInfo, StudentStats, ConfigurableProfilePermissions } from '../../../../common/models/profile';

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

import { CheckboxChangeEvent } from 'antd/lib/checkbox';

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  profile: ProfileInfo | null;
  initialPermissionsSettings: ConfigurableProfilePermissions | null;
  isLoading: boolean;
  isSaving: boolean;
  isEditingModeEnabled: boolean;
  isInitialPermissionsSettingsChanged: boolean;
};

export type ChangedPermissionsSettings = {
  permissionName: string;
  role: string;
}
class ProfilePage extends React.Component<Props, State> {
  state: State = {
    profile: null,
    initialPermissionsSettings: null,
    isLoading: true,
    isSaving: false,
    isEditingModeEnabled: false,
    isInitialPermissionsSettingsChanged: false,
  };

  private onPermissionsSettingsChange = async (
    event: CheckboxChangeEvent, { permissionName, role }: ChangedPermissionsSettings,
  ) => {
    const { profile, initialPermissionsSettings } = this.state;
    const { checked } = event.target;

    if (profile?.permissionsSettings) {
      let changed = clone(get(profile.permissionsSettings, permissionName));

      if (role === 'all') {
        changed = mapValues(changed, () => checked);
      } else {
        changed[role] = checked;
      }

      const newPermissionsSettings = {
        ...profile.permissionsSettings,
        [permissionName]: changed,
      }
      const isInitialPermissionsSettingsChanged = !isEqual(newPermissionsSettings, initialPermissionsSettings);

      await this.setState({
        profile: {
          ...profile,
          permissionsSettings: newPermissionsSettings,
        },
        isInitialPermissionsSettingsChanged,
      });
    }
  }

  private onProfileSettingsChange = async ( { target: { value: changed } }: any, path: string ) => {
    const { profile } = this.state;

    if (profile) {
      // const current = get(profile, path);
      const newProfile = cloneDeep(profile);
      set(newProfile, path, changed);
      // console.log(this.state);
      await this.setState({ profile: newProfile });
      // console.log(path, current, changed, this.state);
    }
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
    await this.setState({ isLoading: true });

    const { router } = this.props;

    try {
      const githubId = router.query ? (router.query.githubId as string) : '';
      const profile = await this.userService.getProfileInfo(githubId);
      const initialPermissionsSettings = profile.permissionsSettings ? cloneDeep(profile.permissionsSettings) : null;
      const isEditingModeEnabled = Boolean(router.asPath.match(/#edit/));

      await this.setState({ isLoading: false, profile, initialPermissionsSettings, isEditingModeEnabled });
    } catch (e) {
      await this.setState({ isLoading: false, profile: null, initialPermissionsSettings: null });
    }
  };

  private changeProfilePageMode = (mode: 'edit' | 'view') => {
    this.setState({ isEditingModeEnabled: mode === 'edit' ? true : false });
  }

  private onSaveSuccess() {
    message.success('Profile was successesfully saved');
  };

  private onSaveError() {
    message.error('Error has occured. Please check your connection and try again');
  };

  private saveProfile = async () => {
    const { profile } = this.state;

    await this.setState({ isSaving: true });

    if (profile) {
      try {
        const { permissionsSettings, generalInfo, contacts } = profile;
        await this.userService.saveProfileInfo({ permissionsSettings, generalInfo, contacts });

        const initialPermissionsSettings = permissionsSettings ? cloneDeep(permissionsSettings) : null;
        await this.setState({
          isSaving: false,
          initialPermissionsSettings,
          isInitialPermissionsSettingsChanged: false,
        });
        this.onSaveSuccess();
      } catch (e) {
        await this.setState({ isSaving: false });
        this.onSaveError();
      }
    }
  }

  async componentDidMount() {
    await this.fetchData();
  }

  render() {
    const { profile, isEditingModeEnabled, initialPermissionsSettings } = this.state;
    const isEditingModeVisible = initialPermissionsSettings && isEditingModeEnabled ? isEditingModeEnabled : false;

    const cards = [
      profile?.generalInfo &&
        <MainCard
          data={profile.generalInfo}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
          onProfileSettingsChange={this.onProfileSettingsChange}
        />,
      profile?.generalInfo?.aboutMyself !== undefined &&
        <AboutCard
          data={profile.generalInfo}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
          onProfileSettingsChange={this.onProfileSettingsChange}
        />,
      profile?.generalInfo?.englishLevel !== undefined &&
        <EnglishCard
          data={profile.generalInfo}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
          onProfileSettingsChange={this.onProfileSettingsChange}
        />,
      profile?.generalInfo?.educationHistory !== undefined &&
        <EducationCard
          data={profile.generalInfo}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
          onProfileSettingsChange={this.onProfileSettingsChange}
        />,
      profile?.contacts !== undefined &&
        <ContactsCard
          data={profile.contacts}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
          onProfileSettingsChange={this.onProfileSettingsChange}
        />,
      profile?.publicFeedback?.length &&
        <PublicFeedbackCard
          data={profile.publicFeedback}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
        />,
      profile?.studentStats?.length &&
        <StudentStatsCard
          data={profile.studentStats}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
        />,
      profile?.mentorStats?.length &&
        <MentorStatsCard
          data={profile.mentorStats}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
        />,
      profile?.studentStats?.length && this.hadStudentCoreJSInterview(profile.studentStats) &&
        <CoreJsIviewsCard data={this.getStudentCoreJSInterviews(profile.studentStats)}/>,
      profile?.stageInterviewFeedback?.length &&
        <PreScreeningIviewCard data={profile.stageInterviewFeedback}/>,
    ].filter(Boolean) as JSX.Element[];

    return (
      <>
        <LoadingScreen show={this.state.isLoading}>
          <Header
            username={this.props.session.githubId}
            onChangeProfilePageMode={this.changeProfilePageMode}
            isProfilePage={initialPermissionsSettings ? true : false}
            isProfileEditingModeEnabled={isEditingModeVisible}
            isSaveButtonVisible={this.state.isInitialPermissionsSettingsChanged}
            onSaveClick={this.saveProfile}
          />
          <Spin spinning={this.state.isSaving} delay={200}>
          {
            this.state.profile
              ? <div style={{ padding: 10 }}>
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
          </Spin>
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
