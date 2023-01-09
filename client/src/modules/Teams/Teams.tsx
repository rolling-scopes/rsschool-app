import { PageLayout } from 'components/PageLayout';
import { TeamsPageProps } from 'pages/course/teams';

function Teams({ session, course, teamDistributionId }: TeamsPageProps) {
  return (
    <PageLayout
      loading={false}
      title="RS Teams"
      background="#F0F2F5"
      githubId={session.githubId}
      courseName={course.name}
    >
      {teamDistributionId}
    </PageLayout>
  );
}

export default Teams;
