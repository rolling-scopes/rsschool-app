import { useMemo, useState } from 'react';
import { PageLayout } from 'components/PageLayout';
import { isCourseManager } from 'domain/user';
import { CoursePageProps } from 'services/models';
import { TeamDistributionApi, TeamDistributionDto } from 'api';
import { TeamDistributionModal } from 'modules/TeamDistribution/components/TeamDistributionModal/';
import { message } from 'antd';
import { useAsync } from 'react-use';
import { TeamDistributionCard } from 'modules/TeamDistribution/components/TeamDistributionCard';
import { WelcomeCard } from 'modules/TeamDistribution/components/WelcomeCard';
import { useModalForm } from 'hooks';

const teamDistributionApi = new TeamDistributionApi();

function TeamDistributions({ session, course }: CoursePageProps) {
  const [distributions, setDistributions] = useState<TeamDistributionDto[]>([]);
  const {
    open: openTeamDistributionModal,
    toggle: toggleTeamDistributionModal,
    formData: teamDistributionData,
  } = useModalForm<TeamDistributionDto>();

  const isManager = useMemo(() => isCourseManager(session, course.id), [session, course.id]);

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
    toggleTeamDistributionModal();
  };

  const handleEditTeamDistribution = (distribution: TeamDistributionDto) => {
    toggleTeamDistributionModal(distribution);
  };

  const handleTeamDistributionSubmit = async () => {
    toggleTeamDistributionModal();
    await loadData();
  };

  const handleRegister = async (distributionId: number) => {
    try {
      await teamDistributionApi.teamDistributionRegistry(course.id, distributionId);
      await loadData();
      message.success('Registration completed.');
    } catch (error) {
      message.error('Registration failed. Please try again later');
    }
  };

  const handleDeleteRegister = async (distributionId: number) => {
    try {
      await teamDistributionApi.teamDistributionDeleteRegistry(course.id, distributionId);
      await loadData();
      message.success('Registration canceled.');
    } catch (error) {
      message.error('Cancellation of registration failed. Please try again later');
    }
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
      {openTeamDistributionModal && (
        <TeamDistributionModal
          data={teamDistributionData}
          onSubmit={handleTeamDistributionSubmit}
          onCancel={() => toggleTeamDistributionModal()}
          courseId={course.id}
        />
      )}
      <div style={{ maxWidth: '1020px', margin: '0 auto' }}>
        <WelcomeCard isManager={isManager} handleCreateTeamDistribution={handleCreateTeamDistribution} />
        {distributions.length
          ? distributions.map(distribution => (
              <TeamDistributionCard
                register={handleRegister}
                deleteRegister={handleDeleteRegister}
                distribution={distribution}
                courseAlias={course.alias}
                isManager={isManager}
                onDelete={handleDeleteTeamDistribution}
                onEdit={handleEditTeamDistribution}
                key={distribution.id}
              />
            ))
          : null}
      </div>
    </PageLayout>
  );
}

export default TeamDistributions;
