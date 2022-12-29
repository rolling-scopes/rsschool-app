import { useMemo, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { PageLayout } from 'components/PageLayout';
import { isCourseManager } from 'domain/user';
import { CoursePageProps } from 'services/models';
import { TeamDistributionDto } from 'api';
import { TeamDistributionModal } from 'modules/TeamDistribution/components/TeamDistributionModal';
import { Button } from 'antd';

function TeamDistribution({ session, course }: CoursePageProps) {
  const [teamDistribution, setTeamDistribution] = useState<Partial<TeamDistributionDto> | null>(null);
  const isManager = useMemo(() => isCourseManager(session, course.id), [session, course.id]);

  const handleCreateTeamDistribution = () => {
    setTeamDistribution({});
  };

  const handleTeamDistributionSubmit = () => {
    setTeamDistribution(null);
  };

  return (
    <PageLayout
      loading={false}
      title="RS Teams"
      background="#F0F2F5"
      githubId={session.githubId}
      courseName={course.name}
    >
      {isManager && (
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTeamDistribution}>
          Team Distribution
        </Button>
      )}
      {teamDistribution && (
        <TeamDistributionModal
          data={teamDistribution}
          onSubmit={handleTeamDistributionSubmit}
          onCancel={() => setTeamDistribution(null)}
          courseId={course.id}
        />
      )}
    </PageLayout>
  );
}

export default TeamDistribution;
