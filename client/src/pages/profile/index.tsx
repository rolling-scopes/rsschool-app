import * as React from 'react';
import get from 'lodash/get';
import set from 'lodash/set';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import mapValues from 'lodash/mapValues';
import clone from 'lodash/clone';
import pullAt from 'lodash/pullAt';
import { Result, Spin, message } from 'antd';
import Masonry from 'react-masonry-css';
import { Header } from 'components/Header';
import { NextRouter, withRouter } from 'next/router';
import { LoadingScreen } from 'components/LoadingScreen';
import withSession, { Session } from 'components/withSession';
import { UserService } from 'services/user';
import { CoursesService } from 'services/courses';
import {
  ProfileInfo,
  StudentStats,
  ConfigurableProfilePermissions,
  Contacts,
  GeneralInfo,
  Consent,
  Discord,
} from 'common/models/profile';

import MainCard from 'components/Profile/MainCard';
import AboutCard from 'components/Profile/AboutCard';
import DiscordCard from 'components/Profile/DiscordCard';
// import EnglishCard from 'components/Profile/EnglishCard';
import EducationCard from 'components/Profile/EducationCard';
import ContactsCard from 'components/Profile/ContactsCard';
import PublicFeedbackCard from 'components/Profile/PublicFeedbackCard';
import StudentStatsCard from 'components/Profile/StudentStatsCard';
import MentorStatsCard from 'components/Profile/MentorStatsCard';
import CoreJsIviewsCard from 'components/Profile/CoreJsIviewsCard';
import { CoreJsInterviewsData } from 'components/Profile/CoreJsIviewsCard';
import PreScreeningIviewCard from 'components/Profile/PreScreeningIviewCard';
import { withGoogleMaps } from 'components/withGoogleMaps';

import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { checkIsProfileOwner } from 'utils/profile-check';

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  profile: ProfileInfo | null;
  initialPermissionsSettings: ConfigurableProfilePermissions | null;
  initialProfileSettings: ProfileInfo | null;
  isProfileOwner: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isEditingModeEnabled: boolean;
  isInitialPermissionsSettingsChanged: boolean;
  isInitialProfileSettingsChanged: boolean;
};

export type ChangedPermissionsSettings = {
  permissionName: string;
  role: string;
};
export class ProfilePage extends React.Component<Props, State> {
  state: State = {
    profile: null,
    initialPermissionsSettings: null,
    initialProfileSettings: null,
    isProfileOwner: false,
    isLoading: true,
    isSaving: false,
    isEditingModeEnabled: false,
    isInitialPermissionsSettingsChanged: false,
    isInitialProfileSettingsChanged: false,
  };

  private onPermissionsSettingsChange = async (
    event: CheckboxChangeEvent,
    { permissionName, role }: ChangedPermissionsSettings,
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
      };
      const isInitialPermissionsSettingsChanged = !isEqual(newPermissionsSettings, initialPermissionsSettings);

      await this.setState({
        profile: {
          ...profile,
          permissionsSettings: newPermissionsSettings,
        },
        isInitialPermissionsSettingsChanged,
      });
    }
  };

  private onProfileSettingsChange = async (event: any = {}, path: string) => {
    const { profile, initialProfileSettings } = this.state;

    if (profile) {
      const newProfile = cloneDeep(profile);

      let isInitialProfileSettingsChanged;
      switch (path) {
        case 'generalInfo.location': {
          const countryName = (event && event.countryName) || profile?.generalInfo?.location.countryName;
          const cityName = (event && event.cityName) || profile?.generalInfo?.location.cityName;
          set(newProfile, `${path}.countryName`, countryName);
          set(newProfile, `${path}.cityName`, cityName);
          isInitialProfileSettingsChanged =
            initialProfileSettings?.generalInfo?.location?.cityName !== cityName ||
            initialProfileSettings?.generalInfo?.location?.countryName !== countryName;
          break;
        }
        case 'generalInfo.englishLevel': {
          set(newProfile, path, event);
          isInitialProfileSettingsChanged = initialProfileSettings?.generalInfo?.englishLevel !== event;
          break;
        }
        case 'generalInfo.educationHistory': {
          if (event.type === 'add') {
            newProfile.generalInfo?.educationHistory.push({
              graduationYear: null,
              faculty: null,
              university: null,
            });
          } else if (event.type === 'delete') {
            pullAt(newProfile.generalInfo?.educationHistory, [event.index]);
          }
          isInitialProfileSettingsChanged = !isEqual(
            initialProfileSettings?.generalInfo?.educationHistory,
            newProfile.generalInfo?.educationHistory,
          );
          break;
        }
        default: {
          set(newProfile, path, event.target.value);
          isInitialProfileSettingsChanged = get(newProfile, path) !== get(initialProfileSettings, path);
        }
      }

      await this.setState({ profile: newProfile, isInitialProfileSettingsChanged });
    }
  };

  private userService = new UserService();
  private coursesService = new CoursesService();

  private getCoursesInfo = async (profile: ProfileInfo) =>
    profile?.studentStats
      ? await Promise.all(profile?.studentStats?.map(({ courseId }) => this.coursesService.getCourse(courseId)))
      : [];

  private hadStudentCoreJSInterview = (stats: StudentStats[]) =>
    stats.some((student: StudentStats) => student.tasks.some(({ interviewFormAnswers }) => interviewFormAnswers));

  private getStudentCoreJSInterviews = (stats: StudentStats[]) =>
    stats
      .filter((student: StudentStats) => student.tasks.some(({ interviewFormAnswers }) => interviewFormAnswers))
      .map(({ tasks, courseFullName, courseName, locationName }) => ({
        courseFullName,
        courseName,
        locationName,
        interviews: tasks
          .filter(({ interviewFormAnswers }) => interviewFormAnswers)
          .map(({ interviewFormAnswers, score, comment, interviewer, name }) => ({
            score,
            comment,
            interviewer,
            answers: interviewFormAnswers,
            name,
          })),
      })) as CoreJsInterviewsData[];

  private fetchData = async () => {
    this.setState({ isLoading: true });

    const { router } = this.props;

    try {
      const githubId = router.query ? (router.query.githubId as string) : undefined;
      const profile = await this.userService.getProfileInfo(githubId);

      const coursesInfo = await this.getCoursesInfo(profile);

      const updateProfile = {
        ...profile,
        studentStats: profile.studentStats?.map(stats => ({
          ...stats,
          isCourseCompleted: coursesInfo.find(course => course.id === stats.courseId)?.completed ?? false,
        })),
      };

      let isProfileOwner = false;
      if (profile) {
        const userId = this.props.session.githubId;
        const profileId = profile.generalInfo!.githubId;
        isProfileOwner = checkIsProfileOwner(userId, profileId);
      }
      const initialPermissionsSettings = profile.permissionsSettings ? cloneDeep(profile.permissionsSettings) : null;
      const initialProfileSettings = profile ? cloneDeep(profile) : null;
      const isEditingModeEnabled = Boolean(router.asPath.match(/#edit/));

      this.setState({
        isLoading: false,
        profile: updateProfile,
        isProfileOwner,
        initialPermissionsSettings,
        isEditingModeEnabled,
        initialProfileSettings,
      });
    } catch (e) {
      this.setState({
        isLoading: false,
        profile: null,
        initialPermissionsSettings: null,
        initialProfileSettings: null,
      });
    }
  };

  private changeProfilePageMode = (mode: 'edit' | 'view') => {
    this.setState({ isEditingModeEnabled: mode === 'edit' ? true : false });
  };

  private onSaveSuccess() {
    message.success('Profile was successesfully saved');
  }

  private onSaveError() {
    message.error('Error has occured. Please check your connection and try again');
  }

  private saveProfile = async () => {
    const { profile, isInitialPermissionsSettingsChanged, isInitialProfileSettingsChanged } = this.state;

    this.setState({ isSaving: true });

    if (profile) {
      try {
        const { permissionsSettings, generalInfo, contacts, consents, discord } = profile;
        await this.userService.saveProfileInfo({
          permissionsSettings: permissionsSettings as ConfigurableProfilePermissions,
          generalInfo: generalInfo as GeneralInfo,
          contacts: contacts as Contacts,
          consents: consents as Consent[],
          discord: discord as Discord,
          isPermissionsSettingsChanged: isInitialPermissionsSettingsChanged,
          isProfileSettingsChanged: isInitialProfileSettingsChanged,
        });

        const initialPermissionsSettings = permissionsSettings ? cloneDeep(permissionsSettings) : null;
        const initialProfileSettings = profile ? cloneDeep(profile) : null;
        this.setState({
          isSaving: false,
          initialPermissionsSettings,
          initialProfileSettings,
          isInitialPermissionsSettingsChanged: false,
          isInitialProfileSettingsChanged: false,
        });
        this.onSaveSuccess();
      } catch (e) {
        this.setState({ isSaving: false });
        this.onSaveError();
      }
    }
  };

  authorizeDiscord = async () => {
    await this.setState({ isLoading: true });

    const discord = await this.userService.getDiscordIds();

    if (discord) {
      this.setState(({ profile, ...state }) => ({
        ...state,
        profile: {
          ...profile,
          discord,
        },
        isInitialProfileSettingsChanged: true,
      }));

      await this.saveProfile();
      this.props.router.replace('/profile');
    }

    await this.setState({ isLoading: false });
  };

  componentDidMount() {
    // it's a dirty hack to fix an issue with empty query params
    // see: https://nextjs.org/docs/routing/dynamic-routes#caveats
    //
    // >> After hydration, Next.js will trigger an update to your application
    // >> to provide the route parameters in the query object.
    setTimeout(async () => {
      await this.fetchData();
      await this.authorizeDiscord();
    }, 100);
  }

  render() {
    const {
      profile,
      isEditingModeEnabled,
      initialPermissionsSettings,
      isInitialPermissionsSettingsChanged,
      isInitialProfileSettingsChanged,
      isProfileOwner,
    } = this.state;
    const isEditingModeVisible = initialPermissionsSettings && isEditingModeEnabled ? isEditingModeEnabled : false;
    const isSaveButtonVisible = isInitialPermissionsSettingsChanged || isInitialProfileSettingsChanged;

    const cards = [
      profile?.generalInfo && (
        <MainCard
          data={profile.generalInfo}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
          onProfileSettingsChange={this.onProfileSettingsChange}
        />
      ),
      profile?.generalInfo?.aboutMyself !== undefined && (
        <AboutCard
          data={profile.generalInfo}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
          onProfileSettingsChange={this.onProfileSettingsChange}
        />
      ),
      // TODO: Temporary disabled
      // profile?.generalInfo?.englishLevel !== undefined && (
      //   <EnglishCard
      //     data={profile.generalInfo}
      //     isEditingModeEnabled={isEditingModeVisible}
      //     permissionsSettings={profile.permissionsSettings}
      //     onPermissionsSettingsChange={this.onPermissionsSettingsChange}
      //     onProfileSettingsChange={this.onProfileSettingsChange}
      //   />
      // ),
      profile?.generalInfo?.educationHistory !== undefined && (
        <EducationCard
          data={profile.generalInfo}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
          onProfileSettingsChange={this.onProfileSettingsChange}
        />
      ),
      profile?.contacts !== undefined && (
        <ContactsCard
          data={profile.contacts}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
          onProfileSettingsChange={this.onProfileSettingsChange}
        />
      ),
      profile?.discord !== undefined && <DiscordCard data={profile.discord} isProfileOwner={isProfileOwner} />,
      profile?.publicFeedback?.length && (
        <PublicFeedbackCard
          data={profile.publicFeedback}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
        />
      ),
      profile?.studentStats?.length && (
        <StudentStatsCard
          username={this.props.session.githubId}
          data={profile.studentStats}
          isProfileOwner={isProfileOwner}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
        />
      ),
      profile?.mentorStats?.length && (
        <MentorStatsCard
          data={profile.mentorStats}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
        />
      ),
      profile?.studentStats?.length && this.hadStudentCoreJSInterview(profile.studentStats) && (
        <CoreJsIviewsCard data={this.getStudentCoreJSInterviews(profile.studentStats)} />
      ),
      profile?.stageInterviewFeedback?.length && <PreScreeningIviewCard data={profile.stageInterviewFeedback} />,
    ].filter(Boolean) as JSX.Element[];

    return (
      <>
        <LoadingScreen show={this.state.isLoading}>
          <Header
            username={this.props.session.githubId}
            onChangeProfilePageMode={this.changeProfilePageMode}
            isProfilePage={initialPermissionsSettings ? true : false}
            isProfileEditingModeEnabled={isEditingModeVisible}
            isSaveButtonVisible={isSaveButtonVisible}
            onSaveClick={this.saveProfile}
          />
          <Spin spinning={this.state.isSaving} delay={200}>
            {this.state.profile ? (
              <div style={{ padding: 10 }}>
                <Masonry
                  breakpointCols={{
                    default: 4,
                    1100: 3,
                    700: 2,
                    500: 1,
                  }}
                  className="masonry"
                  columnClassName="masonry-column"
                >
                  {cards.map((card, idx) => (
                    <div style={{ marginBottom: 16 }} key={`card-${idx}`}>
                      {card}
                    </div>
                  ))}
                </Masonry>
                <style jsx global>{`
                  .masonry {
                    display: flex;
                    margin-left: -16px;
                    width: auto;
                  }
                `}</style>
                <style jsx global>{`
                  .masonry-column {
                    padding-left: 16px;
                    background-clip: padding-box;
                  }
                `}</style>
              </div>
            ) : (
              <>
                <Result status={'403' as any} title="No access or user does not exist" />
              </>
            )}
          </Spin>
        </LoadingScreen>
      </>
    );
  }
}

export default withGoogleMaps(withRouter(withSession(ProfilePage)));
