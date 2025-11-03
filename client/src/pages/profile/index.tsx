import { useContext, useState } from 'react';
import Masonry from 'react-masonry-css';
import { useRouter } from 'next/router';
import { Result, Spin, theme } from 'antd';
import { ProfileApi, UpdateProfileInfoDto, UpdateUserDtoLanguagesEnum } from 'api';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import MainCard from 'components/Profile/MainCard';
import AboutCard from 'components/Profile/AboutCard';
import DiscordCard from 'components/Profile/DiscordCard';
import EducationCard from 'components/Profile/EducationCard';
import ContactsCard from 'components/Profile/ContactsCard';
import PublicFeedbackCard from 'components/Profile/PublicFeedbackCard';
import StudentStatsCard from 'components/Profile/StudentStatsCard';
import { MentorStatsCard } from 'components/Profile/MentorStatsCard';
import LanguagesCard from 'components/Profile/LanguagesCard';
import { withGoogleMaps } from 'components/withGoogleMaps';
import { NotificationChannel, NotificationsService } from 'modules/Notifications/services/notifications';
import { ProfileInfo, ProfileMainCardData, UserService } from 'services/user';
import { SessionContext, SessionProvider } from 'modules/Course/contexts';
import { useAsync } from 'react-use';
import { checkIsProfileOwner, getStudentCoreJSInterviews } from 'utils/profilePageUtils';
import { useMessage } from 'hooks';
import InterviewCard from '@client/components/Profile/InterviewCard';

type ConnectionValue = {
  value: string;
  enabled: boolean;
  lastLinkSentAt?: string;
};

type Connections = Partial<Record<NotificationChannel, ConnectionValue>>;

export type ChangedPermissionsSettings = {
  permissionName: string;
  role: string;
};

const profileApi = new ProfileApi();
const userService = new UserService();
const notificationsService = new NotificationsService();

const Profile = () => {
  const { message } = useMessage();
  const router = useRouter();
  const session = useContext(SessionContext);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [isProfileOwner, setIsProfileOwner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connections, setConnections] = useState<Connections>({});

  const { token } = theme.useToken();

  const fetchData = async () => {
    try {
      const githubId = router.query ? (router.query.githubId as string) : undefined;
      const [profile, connections, { data }] = await Promise.all([
        userService.getProfileInfo(githubId?.toLowerCase()),
        notificationsService.getUserConnections().catch(() => ({})),
        profileApi.getProfile(githubId?.toLowerCase() ?? session.githubId),
      ]);

      const updateProfile = {
        ...profile,
        ...data,
      };

      let isProfileOwner = false;
      if (profile?.generalInfo) {
        const userId = session.githubId;
        const profileId = profile.generalInfo.githubId;
        isProfileOwner = checkIsProfileOwner(userId, profileId);
      }

      setProfile(updateProfile);
      setIsProfileOwner(isProfileOwner);
      setConnections(connections as Connections);
    } catch {
      setProfile(null);
    }
  };

  const sendEmailConfirmationLink = async () => {
    try {
      await userService.sendEmailConfirmationLink();
    } catch {
      message.error('Error has occurred. Please try again later');
    }
  };

  const updateProfile = async (data: UpdateProfileInfoDto) => {
    setIsSaving(true);
    let isUpdated = false;
    try {
      await profileApi.updateProfileInfoFlat(data);
      setIsSaving(false);
      message.success('Profile was successfully saved');
      isUpdated = true;
    } catch {
      setIsSaving(false);
      message.error('Error has occurred. Please check your connection and try again');
      isUpdated = false;
    }

    return isUpdated;
  };

  const authorizeDiscord = async () => {
    const discord = await userService.getDiscordIds();
    if (discord) {
      setProfile(profile => ({
        ...profile,
        publicCvUrl: profile?.publicCvUrl ?? null,
        discord,
      }));

      await updateProfile({ discord });
      router.replace('/profile');
    }
  };

  const mainInfo: ProfileMainCardData = {
    location: profile?.generalInfo?.location ?? null,
    name: profile?.generalInfo?.name ?? '',
    githubId: profile?.generalInfo?.githubId ?? null,
    publicCvUrl: profile?.publicCvUrl ?? null,
  };
  const aboutMyself = profile?.generalInfo?.aboutMyself ?? '';
  const languages = profile?.generalInfo?.languages ?? [];

  const githubId = profile?.generalInfo?.githubId;
  const isAdmin = session.isAdmin;

  const cards = [
    profile?.generalInfo && (
      <MainCard isAdmin={isAdmin} data={mainInfo} isEditingModeEnabled={isProfileOwner} updateProfile={updateProfile} />
    ),
    <AboutCard
      key="about-card"
      data={aboutMyself}
      isEditingModeEnabled={isProfileOwner}
      updateProfile={updateProfile}
    />,
    <LanguagesCard
      key="languages-card"
      data={languages as UpdateUserDtoLanguagesEnum[]}
      isEditingModeEnabled={isProfileOwner}
      updateProfile={updateProfile}
    />,
    profile?.generalInfo?.educationHistory !== undefined && (
      <EducationCard
        data={profile.generalInfo?.educationHistory || []}
        isEditingModeEnabled={isProfileOwner}
        updateProfile={updateProfile}
      />
    ),
    profile?.contacts !== undefined && (
      <ContactsCard
        data={profile.contacts}
        isEditingModeEnabled={isProfileOwner}
        connections={connections}
        sendConfirmationEmail={sendEmailConfirmationLink}
        updateProfile={updateProfile}
      />
    ),
    profile?.discord !== undefined && <DiscordCard data={profile.discord} isProfileOwner={isProfileOwner} />,
    <InterviewCard
      coreJsInterview={getStudentCoreJSInterviews(profile?.studentStats)}
      prescreeningInterview={profile?.stageInterviewFeedback}
    />,
    profile?.publicFeedback?.length && <PublicFeedbackCard data={profile.publicFeedback} />,
    profile?.studentStats?.length && (
      <StudentStatsCard username={session.githubId} data={profile.studentStats} isProfileOwner={isProfileOwner} />
    ),
    profile?.mentorStats?.length && githubId && (
      <MentorStatsCard isAdmin={isAdmin} githubId={githubId} data={profile.mentorStats} />
    ),
  ].filter(Boolean) as JSX.Element[];

  const preloadData = useAsync(async () => {
    await fetchData();
    await authorizeDiscord();
  });

  return (
    <LoadingScreen show={preloadData.loading}>
      <Header />
      <Spin spinning={isSaving} delay={200}>
        {profile ? (
          <div style={{ padding: 10, background: token.colorBgContainer }}>
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
          <Result status={'403'} title="No access or user does not exist" />
        )}
      </Spin>
    </LoadingScreen>
  );
};

function Page() {
  return (
    <SessionProvider>
      <Profile />
    </SessionProvider>
  );
}

export default withGoogleMaps(Page);
