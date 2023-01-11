import { Row, Space, Tabs } from 'antd';
import { useMemo, useState } from 'react';
import { PageLayout } from 'components/PageLayout';
import { TeamsPageProps } from 'pages/course/teams';
import { TeamsHeader } from './components';
import { tabRenderer } from 'components/TabsWithCounter/renderers';
import { isActiveStudent } from 'domain/user';

function Teams({ session, course, teamDistributionDetailed }: TeamsPageProps) {
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

  return (
    <PageLayout
      loading={false}
      title="RS Teams"
      background="#F0F2F5"
      githubId={session.githubId}
      courseName={course.name}
    >
      <Row gutter={24} style={{ background: 'white', marginTop: -15, marginBottom: 24, padding: '24px 24px 0' }}>
        <Space direction="vertical" size={24}>
          <TeamsHeader
            courseAlias={course.alias}
            isStudent={isStudent}
            distributedStudent={teamDistributionDetailed.distributedStudent}
          />
          <Tabs tabBarStyle={{ marginBottom: 0 }} activeKey={activeTab} items={tabs} onChange={setActiveTab} />
        </Space>
      </Row>
    </PageLayout>
  );
}

export default Teams;
