import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { Result, Spin, theme } from 'antd';
import { ProfileApi, UpdateProfileInfoDto, UpdateUserDtoLanguagesEnum } from 'api';
import { dynamicWithSkeleton } from '@client/utils/dynamicWithSkeleton';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import { withGoogleMaps } from 'components/withGoogleMaps';
import { NotificationChannel, NotificationsService } from 'modules/Notifications/services/notifications';
import { ProfileInfo, ProfileMainCardData, UserService } from 'services/user';
import { SessionContext, SessionProvider } from 'modules/Course/contexts';
import { useAsync } from 'react-use';
import { checkIsProfileOwner, getStudentCoreJSInterviews } from 'utils/profilePageUtils';
import { useMessage } from 'hooks';
import Masonry from 'react-masonry-css';
import styles from './index.module.css';

const MainCard = dynamicWithSkeleton(() => import('components/Profile/MainCard'));
const AboutCard = dynamicWithSkeleton(() => import('components/Profile/AboutCard'));
const DiscordCard = dynamicWithSkeleton(() => import('components/Profile/DiscordCard'));
const EducationCard = dynamicWithSkeleton(() => import('components/Profile/EducationCard'));
const ContactsCard = dynamicWithSkeleton(() => import('components/Profile/ContactsCard'));
const PublicFeedbackCard = dynamicWithSkeleton(() => import('components/Profile/PublicFeedbackCard'));
const StudentStatsCard = dynamicWithSkeleton(() => import('components/Profile/StudentStatsCard'));
const MentorStatsCard = dynamicWithSkeleton(() =>
  import('components/Profile/MentorStatsCard').then(m => m.MentorStatsCard),
);
const LanguagesCard = dynamicWithSkeleton(() => import('components/Profile/LanguagesCard'));
const InterviewCard = dynamicWithSkeleton(() => import('@client/components/Profile/InterviewCard'));

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

  const hasEducation = Array.isArray(profile?.generalInfo?.educationHistory);
  const hasContacts = profile?.contacts !== undefined;
  const hasDiscord = profile?.discord !== undefined;
  const hasPublicFeedback = Array.isArray(profile?.publicFeedback) && profile.publicFeedback.length > 0;
  const hasStudentStats = Array.isArray(profile?.studentStats) && profile.studentStats.length > 0;
  const hasMentorStats = Array.isArray(profile?.mentorStats) && profile.mentorStats.length > 0 && !!githubId;

  const cards = [
    profile?.generalInfo
      ? {
          key: 'main',
          node: (
            <MainCard
              isAdmin={isAdmin}
              data={mainInfo}
              isEditingModeEnabled={isProfileOwner}
              updateProfile={updateProfile}
            />
          ),
        }
      : null,
    {
      key: 'about',
      node: <AboutCard data={aboutMyself} isEditingModeEnabled={isProfileOwner} updateProfile={updateProfile} />,
    },
    {
      key: 'languages',
      node: (
        <LanguagesCard
          data={languages as UpdateUserDtoLanguagesEnum[]}
          isEditingModeEnabled={isProfileOwner}
          updateProfile={updateProfile}
        />
      ),
    },
    hasEducation
      ? {
          key: 'education',
          node: (
            <EducationCard
              data={profile!.generalInfo?.educationHistory || []}
              isEditingModeEnabled={isProfileOwner}
              updateProfile={updateProfile}
            />
          ),
        }
      : null,
    hasContacts
      ? {
          key: 'contacts',
          node: (
            <ContactsCard
              data={profile!.contacts!}
              isEditingModeEnabled={isProfileOwner}
              connections={connections}
              sendConfirmationEmail={sendEmailConfirmationLink}
              updateProfile={updateProfile}
            />
          ),
        }
      : null,
    hasDiscord
      ? { key: 'discord', node: <DiscordCard data={profile!.discord!} isProfileOwner={isProfileOwner} /> }
      : null,
    hasPublicFeedback ? { key: 'publicFeedback', node: <PublicFeedbackCard data={profile!.publicFeedback!} /> } : null,
    {
      key: 'interview',
      node: (
        <InterviewCard
          coreJsInterview={getStudentCoreJSInterviews(profile?.studentStats)}
          prescreeningInterview={profile?.stageInterviewFeedback}
        />
      ),
    },
    hasStudentStats
      ? {
          key: 'studentStats',
          node: (
            <StudentStatsCard
              username={session.githubId}
              data={profile!.studentStats!}
              isProfileOwner={isProfileOwner}
            />
          ),
        }
      : null,
    hasMentorStats
      ? {
          key: 'mentorStats',
          node: <MentorStatsCard isAdmin={isAdmin} githubId={githubId!} data={profile!.mentorStats!} />,
        }
      : null,
  ].filter(Boolean) as { key: string; node: JSX.Element }[];

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
              className={styles.masonry!}
              columnClassName={styles.masonryColumn!}
            >
              {cards.map(({ key, node }) => (
                <div style={{ marginBottom: 16 }} key={key}>
                  {node}
                </div>
              ))}
            </Masonry>
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
