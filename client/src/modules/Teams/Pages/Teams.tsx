import { message, Row } from 'antd';
import { useMemo, useState } from 'react';
import { PageLayout } from 'components/PageLayout';
import { TeamsPageProps } from 'pages/course/teams';
import { JoinTeamModal, StudentsWithoutTeamSection, TeamModal, TeamsHeader, TeamsSection } from '../components';
import { isActiveStudent, isCourseManager } from 'domain/user';
import { useCopyToClipboard } from 'react-use';
import { CreateTeamDto, JoinTeamDto, TeamApi } from 'api';
import { showCreateTeamResultModal, showJoinTeamResultModal } from '../utils/showConfirmationModals';
import { useDistribution } from '../hooks';

const teamApi = new TeamApi();

function Teams({ session, course, teamDistributionDetailed }: TeamsPageProps) {
  const { distribution, loadDistribution, loading } = useDistribution(teamDistributionDetailed, course.id);

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showJoinTeamModal, setShowJointTeamModal] = useState(false);

  const [activeTab, setActiveTab] = useState('teams');

  const [, copyToClipboard] = useCopyToClipboard();

  const isManager = useMemo(() => isCourseManager(session, course.id), [session, course.id]);
  const isStudent = useMemo(() => isActiveStudent(session, course.id), [session, course.id]);

  const handleCreateTeam = () => {
    setShowTeamModal(true);
  };

  const handleJoinTeam = () => {
    setShowJointTeamModal(true);
  };

  const joinTeam = async (teamId: number, record: JoinTeamDto) => {
    try {
      const { data: team } = await teamApi.joinTeam(course.id, distribution.id, teamId, record);
      await loadDistribution();
      setShowJointTeamModal(false);
      showJoinTeamResultModal(team);
    } catch (error) {
      message.error('Failed to join to team. Please try later.');
    }
  };

  const submitTeam = async (record: CreateTeamDto) => {
    try {
      const { data: team } = await teamApi.createTeam(course.id, distribution.id, record);
      await loadDistribution();
      setShowTeamModal(false);
      showCreateTeamResultModal(team, course.id, copyToClipboard);
    } catch (error) {
      message.error('Failed to create team. Please try later.');
    }
  };

  const contentRenderers = () => {
    switch (activeTab) {
      case 'teams':
        return <TeamsSection distribution={distribution} courseId={course.id} />;

      case 'students':
        return <StudentsWithoutTeamSection distribution={distribution} courseId={course.id} />;

      case 'myTeam':
        return 'Team name';

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
      {showTeamModal && <TeamModal onSubmit={submitTeam} onCancel={() => setShowTeamModal(false)} />}
      {showJoinTeamModal && <JoinTeamModal onSubmit={joinTeam} onCancel={() => setShowJointTeamModal(false)} />}
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
