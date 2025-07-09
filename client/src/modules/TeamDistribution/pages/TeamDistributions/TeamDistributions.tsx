import { useMemo, useState, useContext } from 'react';
import { PageLayout } from 'components/PageLayout';
import { isCourseManager, isDementor } from 'domain/user';
import { TeamDistributionApi, TeamDistributionDto } from 'api';
import { TeamDistributionModal } from 'modules/TeamDistribution/components/TeamDistributionModal/';
import { message } from 'antd';
import { useAsync } from 'react-use';
import { TeamDistributionCard } from 'modules/TeamDistribution/components/TeamDistributionCard';
import { WelcomeCard } from 'modules/TeamDistribution/components/WelcomeCard';
import { useModalForm } from 'hooks';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { SubmitScoreModal } from 'modules/TeamDistribution/components/SubmitScoreModal';

const teamDistributionApi = new TeamDistributionApi();

function TeamDistributions() {
  const session = useContext(SessionContext);
  const { course } = useActiveCourseContext();
  const [distributions, setDistributions] = useState<TeamDistributionDto[]>([]);
  const {
    open: openTeamDistributionModal,
    toggle: toggleTeamDistributionModal,
    formData: teamDistributionData,
  } = useModalForm<TeamDistributionDto>();
  const [submitScoreModalData, setSubmitScoreModalData] = useState<TeamDistributionDto | null>(null);

  const isManager = useMemo(() => isCourseManager(session, course.id), [session, course.id]);
  const isCourseDementor = useMemo(() => isDementor(session, course.id), [session, course.id]);

  const loadData = async () => {
    try {
      const { data } = await teamDistributionApi.getCourseTeamDistributions(course.id);
      setDistributions(data);
    } catch {
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
    } catch {
      message.error('Registration failed. Please try again later');
    }
  };

  const handleDeleteRegister = async (distributionId: number) => {
    try {
      await teamDistributionApi.teamDistributionDeleteRegistry(course.id, distributionId);
      await loadData();
      message.success('Registration canceled.');
    } catch {
      message.error('Cancellation of registration failed. Please try again later');
    }
  };

  const handleDeleteTeamDistribution = async (distributionId: number) => {
    try {
      await teamDistributionApi.deleteTeamDistribution(course.id, distributionId);
      await loadData();
    } catch {
      message.error('Failed to delete team distribution. Please try later.');
    }
  };

  return (
    <PageLayout loading={loading} title="RS Teams" showCourseName>
      {openTeamDistributionModal && (
        <TeamDistributionModal
          data={teamDistributionData}
          onSubmit={handleTeamDistributionSubmit}
          onCancel={() => toggleTeamDistributionModal()}
          courseId={course.id}
        />
      )}
      {isManager && (
        <SubmitScoreModal distribution={submitScoreModalData} onClose={() => setSubmitScoreModalData(null)} />
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
                isCourseDementor={isCourseDementor}
                onDelete={handleDeleteTeamDistribution}
                onEdit={handleEditTeamDistribution}
                onOpenSubmitScoreModal={() => setSubmitScoreModalData(distribution)}
                key={distribution.id}
              />
            ))
          : null}
      </div>
    </PageLayout>
  );
}

export default TeamDistributions;
