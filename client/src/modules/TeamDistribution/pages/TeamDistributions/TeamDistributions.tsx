import { useMemo, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { PageLayout } from 'components/PageLayout';
import { isCourseManager } from 'domain/user';
import { CoursePageProps } from 'services/models';
import { TeamDistributionApi, TeamDistributionDto } from 'api';
import { TeamDistributionModal } from 'modules/TeamDistribution/components/TeamDistributionModal/';
import { Button, message } from 'antd';
import { useAsync } from 'react-use';
import { TeamDistributionCard } from 'modules/TeamDistribution/components/TeamDistributionCard';

const teamDistributionApi = new TeamDistributionApi();

function TeamDistributions({ session, course }: CoursePageProps) {
  const [teamDistribution, setTeamDistribution] = useState<Partial<TeamDistributionDto> | null>(null);
  const [distributions, setDistributions] = useState<TeamDistributionDto[]>([]);
  const isManager = useMemo(() => isCourseManager(session, course.id), [session, course.id]);

  const { loading } = useAsync(async () => {
    try {
      const { data } = await teamDistributionApi.getCourseTeamDistributions(course.id);
      setDistributions(data ?? []);
    } catch (error) {
      message.error('Something went wrong, please try reloading the page later');
    }
  }, [course.id]);

  const handleCreateTeamDistribution = () => {
    setTeamDistribution({});
  };

  const handleTeamDistributionSubmit = () => {
    setTeamDistribution(null);
  };

  return (
    <PageLayout
      loading={loading}
      title="RS Teams"
      background="#F0F2F5"
      githubId={session.githubId}
      courseName={course.name}
    >
      {teamDistribution && (
        <TeamDistributionModal
          data={teamDistribution}
          onSubmit={handleTeamDistributionSubmit}
          onCancel={() => setTeamDistribution(null)}
          courseId={course.id}
        />
      )}
      {isManager && (
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTeamDistribution}>
          Team Distribution
        </Button>
      )}
      {distributions.length
        ? distributions.map(distribution => <TeamDistributionCard distribution={distribution} />)
        : null}
    </PageLayout>
  );
}

export default TeamDistributions;
