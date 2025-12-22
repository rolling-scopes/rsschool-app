import { act, renderHook } from '@testing-library/react';
import { message } from 'antd';
import { TeamDistributionApi, TeamDistributionDetailedDto } from '@client/api';
import { useDistribution } from './useDistribution';
import { AxiosResponse } from 'axios';

jest.mock('antd', () => ({
  message: {
    error: jest.fn(),
  },
}));

const mockDistributionData = {
  data: { id: 1, name: 'initial distribution' },
} as unknown as TeamDistributionDetailedDto;

describe('useDistribution', () => {
  let courseId: number;

  beforeEach(() => {
    courseId = 1;
  });

  it('should set loading to false and update distribution when getCourseTeamDistributionDetailed is successful', async () => {
    jest.spyOn(TeamDistributionApi.prototype, 'getCourseTeamDistributionDetailed').mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
      data: { ...mockDistributionData, name: 'new distribution' },
    } as AxiosResponse<TeamDistributionDetailedDto>);

    const { result } = renderHook(() => useDistribution(courseId, mockDistributionData.id));

    await act(async () => {
      await result.current.loadDistribution();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.distribution?.name).toEqual('new distribution');
  });

  it('should set loading to false and call message.error when getCourseTeamDistributionDetailed fails', async () => {
    jest.spyOn(TeamDistributionApi.prototype, 'getCourseTeamDistributionDetailed').mockRejectedValueOnce(null);
    const { result } = renderHook(() => useDistribution(courseId, mockDistributionData.id));

    await act(async () => {
      await result.current.loadDistribution();
    });

    expect(result.current.loading).toBe(false);
    expect(message.error).toHaveBeenCalledWith('Something went wrong, please try reloading the page later');
  });
});
