import { Button, Card, Row, Space, Tabs, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { PageLayout } from 'components/PageLayout';
import { TeamsPageProps } from 'pages/course/teams';
import { TeamModal, TeamsHeader } from './components';
import { tabRenderer } from 'components/TabsWithCounter/renderers';
import { isActiveStudent } from 'domain/user';
import { TeamDto } from 'api';

const { Title, Text } = Typography;

function Teams({ session, course, teamDistributionDetailed }: TeamsPageProps) {
  const [team, setTeam] = useState<Partial<TeamDto> | null>(null);
  const [activeTab, setActiveTab] = useState('teams');
  const isStudent = isActiveStudent(session, course.id);

  const tabs = useMemo(() => {
    const tabs = [
      { key: 'teams', label: 'Available teams', count: teamDistributionDetailed.teamsCount },
      { key: 'students', label: 'Students without team', count: teamDistributionDetailed.studentsCount },
    ];
    if (teamDistributionDetailed.distributedStudent) {
      tabs.push({ key: 'myTeam', label: 'My team', count: 0 });
    }
    return tabs.map(el => tabRenderer(el, activeTab));
  }, [activeTab, teamDistributionDetailed]);

  const handleCreateTeam = () => {
    setTeam({});
  };

  return (
    <PageLayout
      loading={false}
      title="RS Teams"
      background="#F0F2F5"
      githubId={session.githubId}
      courseName={course.name}
    >
      {team && <TeamModal data={team} onCancel={() => setTeam(null)} />}
      <Row gutter={24} style={{ background: 'white', marginTop: -15, marginBottom: 24, padding: '24px 24px 0' }}>
        <Space direction="vertical" size={12}>
          <TeamsHeader
            courseAlias={course.alias}
            isStudent={isStudent}
            distributedStudent={teamDistributionDetailed.distributedStudent}
          />
          <Space size={24}>
            {!teamDistributionDetailed.distributedStudent && (
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
            {isStudent && !teamDistributionDetailed.distributedStudent && (
              <Card
                title={<Title level={5}>Have you found a great team to join?</Title>}
                style={{ backgroundColor: '#E6F7FF' }}
              >
                <Space size={12} direction="vertical">
                  <Text type="secondary">
                    View the list of available teams, find an exciting description. Done this? Ask a team lead to share
                    an invitation password to become a member of the greatest team
                  </Text>
                  <Button>Join team</Button>
                </Space>
              </Card>
            )}
          </Space>
          <Tabs tabBarStyle={{ marginBottom: 0 }} activeKey={activeTab} items={tabs} onChange={setActiveTab} />
        </Space>
      </Row>
    </PageLayout>
  );
}

export default Teams;
