import React, { useContext, useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { NextRouter, withRouter } from 'next/router';
import { Result, Spin, message } from 'antd';
import { ProfileApi, UpdateProfileInfoDto, UpdateUserDtoLanguagesEnum } from 'api';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import { StudentStats } from 'common/models/profile';
import MainCard from 'components/Profile/MainCard';
import AboutCard from 'components/Profile/AboutCard';
import DiscordCard from 'components/Profile/DiscordCard';
import EducationCard from 'components/Profile/EducationCard';
import ContactsCard from 'components/Profile/ContactsCard';
import PublicFeedbackCard from 'components/Profile/PublicFeedbackCard';
import StudentStatsCard from 'components/Profile/StudentStatsCard';
import { MentorStatsCard } from 'components/Profile/MentorStatsCard';
import CoreJsIviewsCard from 'components/Profile/CoreJsIviewsCard';
import LanguagesCard from 'components/Profile/LanguagesCard';
import { CoreJsInterviewsData } from 'components/Profile/CoreJsIviewsCard';
import PreScreeningIviewCard from 'components/Profile/PreScreeningIviewCard';
import { withGoogleMaps } from 'components/withGoogleMaps';
import { NotificationChannel, NotificationsService } from 'modules/Notifications/services/notifications';
import { ProfileInfo, ProfileMainCardData, UserService } from 'services/user';
import { ActiveCourseProvider, SessionContext, SessionProvider } from 'modules/Course/contexts';

type Props = {
  router: NextRouter;
};

type ConnectionValue = {
  value: string;
  enabled: boolean;
  lastLinkSentAt?: string;
};

type Connections = Partial<Record<NotificationChannel, ConnectionValue | undefined>>;

export type ChangedPermissionsSettings = {
  permissionName: string;
  role: string;
};

const profileApi = new ProfileApi();
const userService = new UserService();
const notificationsService = new NotificationsService();

const ProfilePage = ({ router }: Props) => {
  const session = useContext(SessionContext);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [isProfileOwner, setIsProfileOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [connections, setConnections] = useState<Connections>({});

  const hadStudentCoreJSInterview = (stats: StudentStats[]) =>
    stats.some((student: StudentStats) => student.tasks.some(({ interviewFormAnswers }) => interviewFormAnswers));

  const getStudentCoreJSInterviews = (stats: StudentStats[]) =>
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

  const checkIsProfileOwner = (githubId: string, requestedGithubId: string): boolean => {
    return githubId === requestedGithubId;
  };

  const fetchData = async () => {
    try {
      const githubId = router.query ? (router.query.githubId as string) : undefined;
      const [profile, connections, { data }] = await Promise.all([
        userService.getProfileInfo(githubId?.toLowerCase()),
        notificationsService.getUserConnections().catch(() => []),
        profileApi.getProfile(githubId?.toLowerCase() ?? session.githubId),
      ]);

      const updateProfile = {
        ...profile,
        ...data,
      };

      let isProfileOwner = false;
      if (profile) {
        const userId = session.githubId;
        const profileId = profile.generalInfo!.githubId;
        isProfileOwner = checkIsProfileOwner(userId, profileId);
      }

      setProfile(updateProfile);
      setIsProfileOwner(isProfileOwner);
      setConnections(connections as Connections);
    } catch (e) {
      setProfile(null);
    }
  };

  const sendEmailConfirmationLink = async () => {
    try {
      await userService.sendEmailConfirmationLink();
    } catch (e) {
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
    } catch (error) {
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

  const cards: JSX.Element[] = [
    profile?.generalInfo && (
      <MainCard data={mainInfo} isEditingModeEnabled={isProfileOwner} updateProfile={updateProfile} />
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
    profile?.publicFeedback?.length && <PublicFeedbackCard data={profile.publicFeedback} />,
    profile?.studentStats?.length && (
      <StudentStatsCard username={session.githubId} data={profile.studentStats} isProfileOwner={isProfileOwner} />
    ),
    profile?.mentorStats?.length && githubId && (
      <MentorStatsCard isAdmin={isAdmin} githubId={githubId} data={profile.mentorStats} />
    ),
    profile?.studentStats?.length && hadStudentCoreJSInterview(profile.studentStats) && (
      <CoreJsIviewsCard data={getStudentCoreJSInterviews(profile.studentStats)} />
    ),
    profile?.stageInterviewFeedback?.length && <PreScreeningIviewCard data={profile.stageInterviewFeedback} />,
  ].filter(Boolean) as JSX.Element[];

  const preloadData = () => {
    fetchData()
      .then(authorizeDiscord)
      .finally(() => setIsLoading(false));
  };

  useEffect(preloadData, []);

  return (
    <>
      <LoadingScreen show={isLoading}>
        <Header />
        <Spin spinning={isSaving} delay={200}>
          {profile ? (
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

export default withGoogleMaps(withRouter(Page));
