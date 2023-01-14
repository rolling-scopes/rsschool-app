import { message } from 'antd';
import { TeamDistributionApi, TeamDistributionDetailedDto } from 'api';
import { useState, useMemo } from 'react';

export function useDistribution(teamDistributionDetailed: TeamDistributionDetailedDto, courseId: number) {
  const [distribution, setDistribution] = useState(teamDistributionDetailed);
  const [loading, setLoading] = useState(false);

  const teamDistributionApi = useMemo(() => new TeamDistributionApi(), []);

  const loadDistribution = async () => {
    try {
      setLoading(true);
      const { data } = await teamDistributionApi.getCourseTeamDistributionDetailed(courseId, distribution.id);
      setDistribution(data);
    } catch (error) {
      message.error('Something went wrong, please try reloading the page later');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    distribution,
    loadDistribution,
  };
}
