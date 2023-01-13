import { Button, Card, message, Row, Space, Tabs, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { PageLayout } from 'components/PageLayout';
import { TeamsPageProps } from 'pages/course/teams';
import { TeamModal, TeamsHeader } from './components';
import { tabRenderer } from 'components/TabsWithCounter/renderers';
import { isActiveStudent, isCourseManager } from 'domain/user';
import { useCopyToClipboard, useMedia } from 'react-use';
import { CreateTeamDto, TeamApi, TeamDistributionApi } from 'api';
import { showCreateTeamResultModal } from './utils/showCreateTeamResultModal';

const { Title, Text } = Typography;

const teamDistributionApi = new TeamDistributionApi();
const teamApi = new TeamApi();

function Teams({ session, course, teamDistributionDetailed }: TeamsPageProps) {
  const mobileView = useMedia('(max-width: 720px)');

  const [distribution, setDistribution] = useState(teamDistributionDetailed);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('teams');

  const [, copyToClipboard] = useCopyToClipboard();

  const isManager = useMemo(() => isCourseManager(session, course.id), [session, course.id]);
  const isStudent = useMemo(() => isActiveStudent(session, course.id), [session, course.id]);

  const tabs = useMemo(() => {
    const tabs = [
      { key: 'teams', label: 'Available teams', count: distribution.teamsCount },
      { key: 'students', label: 'Students without team', count: distribution.studentsCount },
    ];
    if (distribution.distributedStudent) {
      tabs.push({ key: 'myTeam', label: 'My team', count: 0 });
    }
    return tabs.map(el => tabRenderer(el, activeTab));
  }, [activeTab, distribution]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await teamDistributionApi.getCourseTeamDistributionDetailed(course.id, Number(distribution.id));
      setDistribution(data);
    } catch (error) {
      message.error('Something went wrong, please try reloading the page later');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    setShowTeamModal(true);
  };

  const submitTeam = async (record: CreateTeamDto) => {
    try {
      const { data: team } = await teamApi.createTeam(course.id, distribution.id, record);
      await loadData();
      setShowTeamModal(false);
      showCreateTeamResultModal(team, course.id, copyToClipboard);
    } catch (error) {
      message.error('Failed to create team. Please try later.');
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
      <Row gutter={24} style={{ background: 'white', marginTop: -15, marginBottom: 24, padding: '24px 24px 0' }}>
        <Space direction="vertical" size={12}>
          <TeamsHeader
            courseAlias={course.alias}
            isStudent={isStudent}
            distributedStudent={distribution.distributedStudent}
          />
          {(isManager || !distribution.distributedStudent) && (
            <Space size={24} direction={mobileView ? 'vertical' : 'horizontal'}>
              {!distribution.distributedStudent && (
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
                    <Button>Join team</Button>
                  </Space>
                </Card>
              )}
            </Space>
          )}
          <Tabs tabBarStyle={{ marginBottom: 0 }} activeKey={activeTab} items={tabs} onChange={setActiveTab} />
        </Space>
      </Row>
    </PageLayout>
  );
}

export default Teams;
