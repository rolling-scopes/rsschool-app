
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

export const ProfilePage = (props: Props) => {


    const [profile, setProfile] = useState(null);
    const [isProfileOwner, setIsProfileOwner] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [connections, setConnections] = useState({});

    const userService = useRef(new UserService());
    const notificationsService = useRef(new NotificationsService());
    const hadStudentCoreJSInterviewHandler = useCallback((stats: StudentStats[]) =>
    stats.some((student: StudentStats) => student.tasks.some(({ interviewFormAnswers }) => interviewFormAnswers)), []);
    const getStudentCoreJSInterviewsHandler = useCallback((stats: StudentStats[]) =>
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
            interviewDate
          }))
      })) as CoreJsInterviewsData[], []);
    const fetchDataHandler = useCallback(async () => {
    setIsLoading(true);

    const { router, session } = props;

    try {
      const githubId = router.query ? (router.query.githubId as string) : undefined;
      const [profile, connections, { data }] = await Promise.all([
        userService.current.getProfileInfo(githubId),
        notificationsService.current.getUserConnections().catch(() => []),
        profileApi.getProfile(githubId ?? session.githubId)
      ]);

      const updateProfile = {
        ...profile,
        ...data
      };

      let isProfileOwner = false;
      if (profile) {
        const userId = props.session.githubId;
        const profileId = profile.generalInfo!.githubId;
        setIsProfileOwner(checkIsProfileOwner(userId, profileId));
      }

      setIsLoading(false);
    setProfile(updateProfile);
    setIsProfileOwner(isProfileOwner);
    setConnections(connections as State['connections']);
    } catch (e) {
      setIsLoading(false);
    setProfile(null);
    }
  }, [profile, connections, isProfileOwner]);
    const sendEmailConfirmationLinkHandler = useCallback(async () => {
    try {
      await userService.current.sendEmailConfirmationLink();
    } catch (e) {
      message.error('Error has occurred. Please try again later');
    }
  }, []);
    const updateProfileHandler = useCallback(async (data: UpdateProfileInfoDto) => {
    setIsSaving(true);
    let isUpdated = false;
    try {
      await profileApi.updateProfileInfoFlat(data);
      setIsSaving(false);
      message.success('Profile was successfully saved');
      isUpdated = true;
    } catch (error) {
      setIsSaving(false);
      message.error('Error has occurred. Please check your connection and try again');
      isUpdated = false;
    }

    return isUpdated;
  }, []);
    const authorizeDiscordHandler = useCallback(async () => {
    setIsLoading(true);

    const discord = await userService.current.getDiscordIds();

    if (discord) {
      setProfile({
          ...profile,
          publicCvUrl: profile?.publicCvUrl ?? null,
          discord
        });
    setPublicCvUrl(profile?.publicCvUrl ?? null);
    setDiscord(discord);

      await updateProfileHandler({ discord });
      props.router.replace('/profile');
    }

    setIsLoading(false);
  }, [profile]);
    useEffect(() => {
    // it's a dirty hack to fix an issue with empty query params
    // see: https://nextjs.org/docs/routing/dynamic-routes#caveats
    //
    // >> After hydration, Next.js will trigger an update to your application
    // >> to provide the route parameters in the query object.
    setTimeout(async () => {
      await fetchDataHandler();
      await authorizeDiscordHandler();
    }, 100);
  }, []);

    

    const mainInfo: ProfileMainCardData = {
      location: profile?.generalInfo?.location ?? null,
      name: profile?.generalInfo?.name ?? '',
      githubId: profile?.generalInfo?.githubId ?? null,
      publicCvUrl: profile?.publicCvUrl ?? null
    };
    const aboutMyself = profile?.generalInfo?.aboutMyself ?? '';
    const languages = profile?.generalInfo?.languages ?? [];

    const cards = [
      profile?.generalInfo && (
        <MainCard data={mainInfo} isEditingModeEnabled={isProfileOwner} updateProfile={updateProfileHandler} />
      ),
      <AboutCard
        key="about-card"
        data={aboutMyself}
        isEditingModeEnabled={isProfileOwner}
        updateProfile={updateProfileHandler}
      />,
      <LanguagesCard
        key="languages-card"
        data={languages as UpdateUserDtoLanguagesEnum[]}
        isEditingModeEnabled={isProfileOwner}
        updateProfile={updateProfileHandler}
      />,
      profile?.generalInfo?.educationHistory !== undefined && (
        <EducationCard
          data={profile.generalInfo?.educationHistory || []}
          isEditingModeEnabled={isProfileOwner}
          updateProfile={updateProfileHandler}
        />
      ),
      profile?.contacts !== undefined && (
        <ContactsCard
          data={profile.contacts}
          isEditingModeEnabled={isProfileOwner}
          connections={connections}
          sendConfirmationEmail={sendEmailConfirmationLinkHandler}
          updateProfile={updateProfileHandler}
        />
      ),
      profile?.discord !== undefined && <DiscordCard data={profile.discord} isProfileOwner={isProfileOwner} />,
      profile?.publicFeedback?.length && <PublicFeedbackCard data={profile.publicFeedback} />,
      profile?.studentStats?.length && (
        <StudentStatsCard
          username={props.session.githubId}
          data={profile.studentStats}
          isProfileOwner={isProfileOwner}
        />
      ),
      profile?.mentorStats?.length && <MentorStatsCard data={profile.mentorStats} />,
      profile?.studentStats?.length && hadStudentCoreJSInterviewHandler(profile.studentStats) && (
        <CoreJsIviewsCard data={getStudentCoreJSInterviewsHandler(profile.studentStats)} />
      ),
      profile?.stageInterviewFeedback?.length && <PreScreeningIviewCard data={profile.stageInterviewFeedback} />
    ].filter(Boolean) as JSX.Element[];

    return (
      <>
        <LoadingScreen show={isLoading}>
          <Header username={props.session.githubId} />
          <Spin spinning={isSaving} delay={200}>
            {profile ? (
              <div style={{ padding: 10 }}>
                <Masonry
                  breakpointCols={{
                    default: 4,
                    1100: 3,
                    700: 2,
                    500: 1
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
};




const checkIsProfileOwner = (githubId: string, requestedGithubId: string): boolean => {
  return githubId === requestedGithubId;
};

export default withGoogleMaps(withRouter(withSession(ProfilePage)));
