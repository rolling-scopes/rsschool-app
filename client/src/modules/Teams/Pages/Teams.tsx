import { message, notification, Row } from 'antd';
import { useMemo, useState } from 'react';
import { PageLayout } from 'components/PageLayout';
import { TeamsPageProps } from 'pages/course/teams';
import {
  JoinTeamModal,
  MyTeamSection,
  StudentsWithoutTeamSection,
  TeamModal,
  TeamsHeader,
  TeamsSection,
} from '../components';
import { isActiveStudent, isCourseManager } from 'domain/user';
import { useCopyToClipboard } from 'react-use';
import { CreateTeamDto, JoinTeamDto, TeamApi, TeamDto } from 'api';
import { showCreateTeamResultModal, showJoinTeamResultModal } from '../utils/showConfirmationModals';
import { useDistribution } from '../hooks';

const teamApi = new TeamApi();

function Teams({ session, course, teamDistributionDetailed }: TeamsPageProps) {
  const { distribution, loadDistribution, loading } = useDistribution(teamDistributionDetailed, course.id);

  const [teamData, setTeamData] = useState<Partial<TeamDto> | null>(null);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);

  const [activeTab, setActiveTab] = useState('teams');

  const [, copyToClipboard] = useCopyToClipboard();

  const isManager = useMemo(() => isCourseManager(session, course.id), [session, course.id]);
  const isStudent = useMemo(() => isActiveStudent(session, course.id), [session, course.id]);
  const studentId = useMemo(() => session.courses[course.id]?.studentId, [session, course.id]);

  const handleCreateTeam = () => {
    setTeamData({});
  };

  const handleJoinTeam = () => {
    setShowJoinTeamModal(true);
  };

  const joinTeam = async (teamId: number, record: JoinTeamDto) => {
    try {
      const { data: team } = await teamApi.joinTeam(course.id, distribution.id, teamId, record);
      await loadDistribution();
      setShowJoinTeamModal(false);
      showJoinTeamResultModal(team);
    } catch (error) {
      message.error('Failed to join to team. Please try later.');
    }
  };

  const copyPassword = async (teamId: number): Promise<void> => {
    const teamApi = new TeamApi();
    try {
      const { data } = await teamApi.getTeamPassword(course.id, distribution.id, teamId);
      copyToClipboard(data.password);
      notification.success({ message: 'Password copied to clipboard', duration: 2 });
    } catch (error) {
      message.error('Something went wrong. Please try again later.');
    }
  };

  const submitTeam = async (record: CreateTeamDto, id?: number) => {
    try {
      if (id) {
        await teamApi.updateTeam(course.id, distribution.id, id, record);
      } else {
        const { data: team } = await teamApi.createTeam(course.id, distribution.id, record);
        showCreateTeamResultModal(team, copyPassword);
      }
      await loadDistribution();
      setTeamData(null);
    } catch (error) {
      message.error('Failed to create team. Please try later.');
    }
  };

  const contentRenderers = () => {
    switch (activeTab) {
      case 'teams':
        return <TeamsSection distribution={distribution} />;

      case 'students':
        return <StudentsWithoutTeamSection distribution={distribution} />;

      case 'myTeam':
        return (
          <MyTeamSection
            distribution={distribution}
            setTeamData={setTeamData}
            studentId={studentId}
            copyPassword={copyPassword}
            reloadDistribution={loadDistribution}
            setActiveTab={setActiveTab}
          />
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout
      loading={loading}
      title="RS Teams"
      background="#F0F2F5"
      githubId={session.githubId}
      courseName={course.name}
    >
      {teamData && <TeamModal data={teamData} onSubmit={submitTeam} onCancel={() => setTeamData(null)} />}
      {showJoinTeamModal && <JoinTeamModal onSubmit={joinTeam} onCancel={() => setShowJoinTeamModal(false)} />}
      <TeamsHeader
        courseAlias={course.alias}
        isManager={isManager}
        isStudent={isStudent}
        activeTab={activeTab}
        distribution={distribution}
        setActiveTab={setActiveTab}
        handleCreateTeam={handleCreateTeam}
        handleJoinTeam={handleJoinTeam}
      />
      <Row style={{ background: 'white', padding: '24px', margin: 24 }}>{contentRenderers()}</Row>
    </PageLayout>
  );
}

export default Teams;
