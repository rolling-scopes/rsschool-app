import { Button, Card, message, Row, Space, Tabs, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { PageLayout } from 'components/PageLayout';
import { TeamsPageProps } from 'pages/course/teams';
import { JoinTeamModal, StudentsWithoutTeamSection, TeamModal, TeamsHeader, TeamsSection } from '../components';
import { tabRenderer } from 'components/TabsWithCounter/renderers';
import { isActiveStudent, isCourseManager } from 'domain/user';
import { useCopyToClipboard, useMedia } from 'react-use';
import { CreateTeamDto, JoinTeamDto, TeamApi } from 'api';
import { showCreateTeamResultModal, showJoinTeamResultModal } from '../utils/showConfirmationModals';
import { useDistribution } from '../hooks';

const { Title, Text } = Typography;

const teamApi = new TeamApi();

function Teams({ session, course, teamDistributionDetailed }: TeamsPageProps) {
  const mobileView = useMedia('(max-width: 720px)');

  const { distribution, loadDistribution, loading } = useDistribution(teamDistributionDetailed, course.id);

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showJoinTeamModal, setShowJointTeamModal] = useState(false);

  const [activeTab, setActiveTab] = useState('teams');

  const [, copyToClipboard] = useCopyToClipboard();

  const isManager = useMemo(() => isCourseManager(session, course.id), [session, course.id]);
  const isStudent = useMemo(() => isActiveStudent(session, course.id), [session, course.id]);

  const tabs = useMemo(() => {
    const tabs = [
      { key: 'teams', label: 'Available teams', count: distribution.teamsCount },
      { key: 'students', label: 'Students without team', count: distribution.studentsWithoutTeamCount },
    ];
    if (distribution.distributedStudent) {
      tabs.push({ key: 'myTeam', label: 'My team', count: 0 });
    }
    return tabs.map(el => tabRenderer(el, activeTab));
  }, [activeTab, distribution]);

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
      <Row gutter={24} style={{ background: 'white', marginTop: -15, padding: '24px 24px 0' }}>
        <Space direction="vertical" size={12}>
          <TeamsHeader
            courseAlias={course.alias}
            isStudent={isStudent}
            distributedStudent={distribution.distributedStudent}
          />
          {(isManager || !distribution.distributedStudent) && (
            <Space size={24} direction={mobileView ? 'vertical' : 'horizontal'}>
              {(!distribution.distributedStudent || isManager) && (
                <Card
                  title={<Title level={5}>Are you going to be a leader completing a group task?</Title>}
                  style={{ backgroundColor: '#E6F7FF' }}
                >
                  <Space size={12} direction="vertical">
                    <Text type="secondary">
                      Create the team, compose a description and provide a link to a team chat. You’ll get an invitation
                      password to share with your team members. Being a leader is honorable and responsible
                    </Text>
                    <Button onClick={handleCreateTeam}>Create team</Button>
                  </Space>
                </Card>
              )}
              {isStudent && !distribution.distributedStudent && (
                <Card
                  title={<Title level={5}>Have you found a great team to join?</Title>}
                  style={{ backgroundColor: '#E6F7FF' }}
                >
                  <Space size={12} direction="vertical">
                    <Text type="secondary">
                      View the list of available teams, find an exciting description. Done this? Ask a team lead to
                      share an invitation password to become a member of the greatest team
                    </Text>
                    <Button onClick={handleJoinTeam}>Join team</Button>
                  </Space>
                </Card>
              )}
            </Space>
          )}
          <Tabs tabBarStyle={{ marginBottom: 0 }} activeKey={activeTab} items={tabs} onChange={setActiveTab} />
        </Space>
      </Row>
      <Row style={{ background: 'white', padding: '24px', margin: 24 }}>{contentRenderers()}</Row>
    </PageLayout>
  );
}

export default Teams;
