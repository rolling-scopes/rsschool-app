import { Row, Space, Tabs } from 'antd';
import { useMemo, useState } from 'react';
import { PageLayout } from 'components/PageLayout';
import { TeamsPageProps } from 'pages/course/teams';
import { TeamsHeader } from './components';
import { tabRenderer } from 'components/TabsWithCounter/renderers';

function Teams({ session, course, teamDistributionDetailed }: TeamsPageProps) {
  const [activeTab, setActiveTab] = useState('teams');

  const tabs = useMemo(() => {
    const tabs = [
      { key: 'teams', label: 'Available teams', count: 0 },
      { key: 'students', label: 'Students without team', count: teamDistributionDetailed.studentWithoutTeam.length },
    ];
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
          <TeamsHeader courseAlias={course.alias} />
          <Tabs tabBarStyle={{ marginBottom: 0 }} activeKey={activeTab} items={tabs} onChange={setActiveTab} />
        </Space>
      </Row>
    </PageLayout>
  );
}

export default Teams;
