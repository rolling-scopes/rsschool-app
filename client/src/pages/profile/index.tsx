import * as React from 'react';
import get from 'lodash/get';
import set from 'lodash/set';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import mapValues from 'lodash/mapValues';
import clone from 'lodash/clone';
import pullAt from 'lodash/pullAt';
import { Result, Spin, message } from 'antd';
import css from 'styled-jsx/css';
import Masonry from 'react-masonry-css';
import { Header } from 'components/Header';
import { NextRouter, withRouter } from 'next/router';
import { LoadingScreen } from 'components/LoadingScreen';
import withSession, { Session } from 'components/withSession';
import { UserService } from 'services/user';
import {
  ProfileInfo,
  StudentStats,
  ConfigurableProfilePermissions,
  Contacts,
  GeneralInfo,
  Consent,
} from '../../../../common/models/profile';

import MainCard from 'components/Profile/MainCard';
import AboutCard from 'components/Profile/AboutCard';
import EnglishCard from 'components/Profile/EnglishCard';
import EducationCard from 'components/Profile/EducationCard';
import ContactsCard from 'components/Profile/ContactsCard';
import ConsentsCard from 'components/Profile/ConsentsCard';
import PublicFeedbackCard from 'components/Profile/PublicFeedbackCard';
import StudentStatsCard from 'components/Profile/StudentStatsCard';
import MentorStatsCard from 'components/Profile/MentorStatsCard';
import CoreJsIviewsCard from 'components/Profile/CoreJsIviewsCard';
import { CoreJsInterviewData } from 'components/Profile/CoreJsIviewsCard';
import PreScreeningIviewCard from 'components/Profile/PreScreeningIviewCard';

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
        case 'consent': {
          const { id, checked } = event;
          const consents = profile?.consents ?? [];
          const [existingConsent] = consents.filter((consent) => consent.channelType === id);
          const otherConsents = consents.filter((consent) => consent.channelType !== id);
          const newConsents = [...otherConsents];
          if (existingConsent) {
            const newConsent = cloneDeep(existingConsent);
            newConsent.optIn = checked;
            newConsents.push(newConsent);
          } else if (id === 'email' && initialProfileSettings?.contacts?.email) {
            const newConsent = {
              optIn: checked,
              channelType: id,
              channelValue: initialProfileSettings?.contacts?.email,
            };
            newConsents.push(newConsent);
          }
          newProfile.consents = newConsents;
          const initialConsents = initialProfileSettings?.consents;
          const getconsentParamsString = ({ optIn, channelType }: Consent) => `${optIn}${channelType}`;
          const consentParamsStrings = new Set(initialConsents!.map(getconsentParamsString));
          isInitialProfileSettingsChanged = !newConsents.every((consent) =>
            consentParamsStrings.has(getconsentParamsString(consent)),
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

  private hadStudentCoreJSInterview = (stats: StudentStats[]) =>
    stats.some((student: StudentStats) => student.tasks.some(({ interviewFormAnswers }) => interviewFormAnswers));

  private getStudentCoreJSInterviews = (stats: StudentStats[]) =>
    stats
      .filter((student: StudentStats) => student.tasks.some(({ interviewFormAnswers }) => interviewFormAnswers))
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
      const githubId = router.query ? (router.query.githubId as string) : undefined;
      const profile = await this.userService.getProfileInfo(githubId);
      let isProfileOwner = false;
      if (profile) {
        const userId = this.props.session.githubId;
        const profileId = profile.generalInfo!.githubId;
        isProfileOwner = checkIsProfileOwner(userId, profileId);
      }
      const initialPermissionsSettings = profile.permissionsSettings ? cloneDeep(profile.permissionsSettings) : null;
      const initialProfileSettings = profile ? cloneDeep(profile) : null;
      const isEditingModeEnabled = Boolean(router.asPath.match(/#edit/));

      await this.setState({
        isLoading: false,
        profile,
        isProfileOwner,
        initialPermissionsSettings,
        isEditingModeEnabled,
        initialProfileSettings,
      });
    } catch (e) {
      await this.setState({
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

    await this.setState({ isSaving: true });

    if (profile) {
      try {
        const { permissionsSettings, generalInfo, contacts, consents } = profile;
        await this.userService.saveProfileInfo({
          permissionsSettings: permissionsSettings as ConfigurableProfilePermissions,
          generalInfo: generalInfo as GeneralInfo,
          contacts: contacts as Contacts,
          consents: consents as Consent[],
          isPermissionsSettingsChanged: isInitialPermissionsSettingsChanged,
          isProfileSettingsChanged: isInitialProfileSettingsChanged,
        });

        const initialPermissionsSettings = permissionsSettings ? cloneDeep(permissionsSettings) : null;
        const initialProfileSettings = profile ? cloneDeep(profile) : null;
        await this.setState({
          isSaving: false,
          initialPermissionsSettings,
          initialProfileSettings,
          isInitialPermissionsSettingsChanged: false,
          isInitialProfileSettingsChanged: false,
        });
        this.onSaveSuccess();
      } catch (e) {
        await this.setState({ isSaving: false });
        this.onSaveError();
      }
    }
  };

  async componentDidMount() {
    await this.fetchData();
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
      profile?.generalInfo?.englishLevel !== undefined && (
        <EnglishCard
          data={profile.generalInfo}
          isEditingModeEnabled={isEditingModeVisible}
          permissionsSettings={profile.permissionsSettings}
          onPermissionsSettingsChange={this.onPermissionsSettingsChange}
          onProfileSettingsChange={this.onProfileSettingsChange}
        />
      ),
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
      profile?.consents && (
        <ConsentsCard
          data={profile.consents}
          isEditingModeEnabled={isEditingModeVisible}
          onProfileSettingsChange={this.onProfileSettingsChange}
        />
      ),
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
                  className={masonryClassName}
                  columnClassName={masonryColumnClassName}
                >
                  {cards.map((card, idx) => (
                    <div style={{ marginBottom: gapSize }} key={`card-${idx}`}>
                      {card}
                    </div>
                  ))}
                </Masonry>
                {masonryStyles}
                {masonryColumnStyles}
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
