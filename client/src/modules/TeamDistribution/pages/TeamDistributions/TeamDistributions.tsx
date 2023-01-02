import { useMemo, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { PageLayout } from 'components/PageLayout';
import { isActiveStudent, isCourseManager } from 'domain/user';
import { CoursePageProps } from 'services/models';
import { TeamDistributionApi, TeamDistributionDto } from 'api';
import { TeamDistributionModal } from 'modules/TeamDistribution/components/TeamDistributionModal/';
import { Button, message } from 'antd';
import { useAsync } from 'react-use';
import { TeamDistributionCard } from 'modules/TeamDistribution/components/TeamDistributionCard';
import { WelcomeCard } from 'modules/TeamDistribution/components/WelcomeCard';

const teamDistributionApi = new TeamDistributionApi();

function TeamDistributions({ session, course }: CoursePageProps) {
  const [teamDistribution, setTeamDistribution] = useState<Partial<TeamDistributionDto> | null>(null);
  const [distributions, setDistributions] = useState<TeamDistributionDto[]>([]);
  const isManager = useMemo(() => isCourseManager(session, course.id), [session, course.id]);
  const isStudent = useMemo(() => isActiveStudent(session, course.id), [session, course.id]);

  const loadData = async () => {
    try {
      const { data } = await teamDistributionApi.getCourseTeamDistributions(course.id);
      setDistributions(data);
    } catch (error) {
      message.error('Something went wrong, please try reloading the page later');
    }
  };

  const { loading } = useAsync(loadData, [course.id]);

  const handleCreateTeamDistribution = () => {
    setTeamDistribution({});
  };

  const handleEditTeamDistribution = (distribution: TeamDistributionDto) => {
    setTeamDistribution(distribution);
  };

  const handleTeamDistributionSubmit = async () => {
    setTeamDistribution(null);
    await loadData();
  };

  const handleDeleteTeamDistribution = async (distributionId: number) => {
    try {
      await teamDistributionApi.deleteTeamDistribution(course.id, distributionId);
      await loadData();
    } catch (error) {
      message.error('Failed to delete team distribution. Please try later.');
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
      {isStudent && <WelcomeCard />}
      {distributions.length
        ? distributions.map(distribution => (
            <TeamDistributionCard
              distribution={distribution}
              isManager={isManager}
              onDelete={handleDeleteTeamDistribution}
              onEdit={handleEditTeamDistribution}
              key={distribution.id}
            />
          ))
        : null}
    </PageLayout>
  );
}

export default TeamDistributions;
