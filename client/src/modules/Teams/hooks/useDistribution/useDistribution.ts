import { useRequest } from 'ahooks';
import { message } from 'antd';
import { TeamDistributionApi } from '@client/api';

const teamDistributionApi = new TeamDistributionApi();

export function useDistribution(courseId: number, teamDistributionId: number) {
  const { data, loading, runAsync } = useRequest(async () => {
    try {
      const { data } = await teamDistributionApi.getCourseTeamDistributionDetailed(courseId, teamDistributionId);
      return data;
    } catch {
      message.error('Something went wrong, please try reloading the page later');
    }
  });

  return {
    loading,
    distribution: data,
    loadDistribution: runAsync,
  };
}
