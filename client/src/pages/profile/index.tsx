import * as React from 'react';
import Masonry from 'react-masonry-css';
import { NextRouter, withRouter } from 'next/router';
import { Result, Spin, message } from 'antd';
import { ProfileApi, UpdateProfileInfoDto, UpdateUserDtoLanguagesEnum } from 'api';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import withSession, { Session } from 'components/withSession';
import { StudentStats } from 'common/models/profile';
import MainCard from 'components/Profile/MainCard';
import AboutCard from 'components/Profile/AboutCard';
import DiscordCard from 'components/Profile/DiscordCard';
import EducationCard from 'components/Profile/EducationCard';
import ContactsCard from 'components/Profile/ContactsCard';
import PublicFeedbackCard from 'components/Profile/PublicFeedbackCard';
import StudentStatsCard from 'components/Profile/StudentStatsCard';
import MentorStatsCard from 'components/Profile/MentorStatsCard';
import CoreJsIviewsCard from 'components/Profile/CoreJsIviewsCard';
import LanguagesCard from 'components/Profile/LanguagesCard';
import { CoreJsInterviewsData } from 'components/Profile/CoreJsIviewsCard';
import PreScreeningIviewCard from 'components/Profile/PreScreeningIviewCard';
import { withGoogleMaps } from 'components/withGoogleMaps';
import { NotificationChannel, NotificationsService } from 'modules/Notifications/services/notifications';
import { ProfileInfo, ProfileMainCardData, UserService } from 'services/user';
import { SessionProvider } from 'modules/Course/contexts';
import { ActiveCourseProvider } from 'modules/Course/contexts/ActiveCourseContext';

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  profile: ProfileInfo | null;
  isProfileOwner: boolean;
  isLoading: boolean;
  isSaving: boolean;
  connections: Partial<
    Record<
      NotificationChannel,
      | {
          value: string;
          enabled: boolean;
        }
      | undefined
    >
  >;
};

export type ChangedPermissionsSettings = {
  permissionName: string;
  role: string;
};

const profileApi = new ProfileApi();

export class ProfilePage extends React.Component<Props, State> {
  state: State = {
    profile: null,
    isProfileOwner: false,
    isLoading: true,
    isSaving: false,
    connections: {},
  };

  private userService = new UserService();
  private notificationsService = new NotificationsService();

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
          .map(({ interviewFormAnswers, score, comment, interviewer, name, interviewDate }) => ({
            score,
            comment,
            interviewer,
            answers: interviewFormAnswers,
            name,
            interviewDate,
          })),
      })) as CoreJsInterviewsData[];

  private fetchData = async () => {
    this.setState({ isLoading: true });

    const { router, session } = this.props;

    try {
      const githubId = router.query ? (router.query.githubId as string) : undefined;
      const [profile, connections, { data }] = await Promise.all([
        this.userService.getProfileInfo(githubId?.toLowerCase()),
        this.notificationsService.getUserConnections().catch(() => []),
        profileApi.getProfile(githubId?.toLowerCase() ?? session.githubId),
      ]);

      const updateProfile = {
        ...profile,
        ...data,
      };

      let isProfileOwner = false;
      if (profile) {
        const userId = this.props.session.githubId;
        const profileId = profile.generalInfo!.githubId;
        isProfileOwner = checkIsProfileOwner(userId, profileId);
      }

      this.setState({
        isLoading: false,
        profile: updateProfile,
        isProfileOwner,
        connections: connections as State['connections'],
      });
    } catch (e) {
      this.setState({
        isLoading: false,
        profile: null,
      });
    }
  };

  private sendEmailConfirmationLink = async () => {
    try {
      await this.userService.sendEmailConfirmationLink();
    } catch (e) {
      message.error('Error has occurred. Please try again later');
    }
  };

  private updateProfile = async (data: UpdateProfileInfoDto) => {
    this.setState({ isSaving: true });
    let isUpdated = false;
    try {
      await profileApi.updateProfileInfoFlat(data);
      this.setState({ isSaving: false });
      message.success('Profile was successfully saved');
      isUpdated = true;
    } catch (error) {
      this.setState({ isSaving: false });
      message.error('Error has occurred. Please check your connection and try again');
      isUpdated = false;
    }

    return isUpdated;
  };

  authorizeDiscord = async () => {
    this.setState({ isLoading: true });

    const discord = await this.userService.getDiscordIds();

    if (discord) {
      this.setState(({ profile, ...state }) => ({
        ...state,
        profile: {
          ...profile,
          publicCvUrl: profile?.publicCvUrl ?? null,
          discord,
        },
      }));

      await this.updateProfile({ discord });
      this.props.router.replace('/profile');
    }

    this.setState({ isLoading: false });
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
    const { profile, isProfileOwner, connections } = this.state;

    const mainInfo: ProfileMainCardData = {
      location: profile?.generalInfo?.location ?? null,
      name: profile?.generalInfo?.name ?? '',
      githubId: profile?.generalInfo?.githubId ?? null,
      publicCvUrl: profile?.publicCvUrl ?? null,
    };
    const aboutMyself = profile?.generalInfo?.aboutMyself ?? '';
    const languages = profile?.generalInfo?.languages ?? [];

    const cards = [
      profile?.generalInfo && (
        <MainCard data={mainInfo} isEditingModeEnabled={isProfileOwner} updateProfile={this.updateProfile} />
      ),
      <AboutCard
        key="about-card"
        data={aboutMyself}
        isEditingModeEnabled={isProfileOwner}
        updateProfile={this.updateProfile}
      />,
      <LanguagesCard
        key="languages-card"
        data={languages as UpdateUserDtoLanguagesEnum[]}
        isEditingModeEnabled={isProfileOwner}
        updateProfile={this.updateProfile}
      />,
      profile?.generalInfo?.educationHistory !== undefined && (
        <EducationCard
          data={profile.generalInfo?.educationHistory || []}
          isEditingModeEnabled={isProfileOwner}
          updateProfile={this.updateProfile}
        />
      ),
      profile?.contacts !== undefined && (
        <ContactsCard
          data={profile.contacts}
          isEditingModeEnabled={isProfileOwner}
          connections={connections}
          sendConfirmationEmail={this.sendEmailConfirmationLink}
          updateProfile={this.updateProfile}
        />
      ),
      profile?.discord !== undefined && <DiscordCard data={profile.discord} isProfileOwner={isProfileOwner} />,
      profile?.publicFeedback?.length && <PublicFeedbackCard data={profile.publicFeedback} />,
      profile?.studentStats?.length && (
        <StudentStatsCard
          username={this.props.session.githubId}
          data={profile.studentStats}
          isProfileOwner={isProfileOwner}
        />
      ),
      profile?.mentorStats?.length && <MentorStatsCard data={profile.mentorStats} />,
      profile?.studentStats?.length && this.hadStudentCoreJSInterview(profile.studentStats) && (
        <CoreJsIviewsCard data={this.getStudentCoreJSInterviews(profile.studentStats)} />
      ),
      profile?.stageInterviewFeedback?.length && <PreScreeningIviewCard data={profile.stageInterviewFeedback} />,
    ].filter(Boolean) as JSX.Element[];

    return (
      <>
        <LoadingScreen show={this.state.isLoading}>
          <Header />
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

const checkIsProfileOwner = (githubId: string, requestedGithubId: string): boolean => {
  return githubId === requestedGithubId;
};

function Page(props: Props) {
  return (
    <SessionProvider>
      <ActiveCourseProvider>
        <ProfilePage {...props} />
      </ActiveCourseProvider>
    </SessionProvider>
  );
}

export default withGoogleMaps(withRouter(withSession(Page)));
