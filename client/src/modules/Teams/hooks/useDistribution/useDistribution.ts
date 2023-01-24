import { message } from 'antd';
import { TeamDistributionApi, TeamDistributionDetailedDto } from 'api';
import { useLoading } from 'components/useLoading';
import { useState, useMemo } from 'react';

export function useDistribution(teamDistributionDetailed: TeamDistributionDetailedDto, courseId: number) {
  const [distribution, setDistribution] = useState(teamDistributionDetailed);
  const [loading, withLoading] = useLoading(false);

  const teamDistributionApi = useMemo(() => new TeamDistributionApi(), []);

  const loadDistribution = withLoading(async () => {
    try {
      const { data } = await teamDistributionApi.getCourseTeamDistributionDetailed(courseId, distribution.id);
      setDistribution(data);
    } catch (error) {
      message.error('Something went wrong, please try reloading the page later');
    }
  });

  return {
    loading,
    distribution,
    loadDistribution,
  };
}
