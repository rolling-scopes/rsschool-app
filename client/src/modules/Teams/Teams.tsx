import { Row } from 'antd';
import { PageLayout } from 'components/PageLayout';
import { TeamsPageProps } from 'pages/course/teams';
import { TeamsHeader } from './components';

function Teams({ session, course }: TeamsPageProps) {
  return (
    <PageLayout
      loading={false}
      title="RS Teams"
      background="#F0F2F5"
      githubId={session.githubId}
      courseName={course.name}
    >
      <Row gutter={24} style={{ background: 'white', marginTop: -15, marginBottom: 24, padding: '24px 24px 0' }}>
        <TeamsHeader courseAlias={course.alias} />
      </Row>
    </PageLayout>
  );
}

export default Teams;
