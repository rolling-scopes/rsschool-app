import { OpportunitiesApi } from 'api';
import { AxiosError } from 'axios';
import { useAsync } from 'react-use';

type Props = {
  githubId: string;
  actualTime: number;
};

const opportunitiesService = new OpportunitiesApi();

export function useResumeData({ githubId, actualTime }: Props) {
  const fetchData = useAsync(async () => {
    try {
      const { data } = await opportunitiesService.getResume(githubId);
      return data;
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 404) {
        return null;
      }
      throw err;
    }
  }, [actualTime]);

  return [fetchData.value, fetchData.error, fetchData.loading] as const;
}
