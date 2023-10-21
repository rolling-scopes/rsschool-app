import { useSubmitTeamScore } from './useSubmitTeamScore';
import { TeamDistributionApi } from 'api';
import { message } from 'antd';
import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

jest.mock('api');
jest.mock('antd', () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('useSubmitTeamScore', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should have the correct initial states', () => {
    const { result } = renderHook(() => useSubmitTeamScore(1, 2));

    expect(result.current.loading).toBe(false);
    expect(result.current.taskId).toBe(null);
  });

  it('should set taskId correctly', () => {
    const { result } = renderHook(() => useSubmitTeamScore(1, 2));

    act(() => {
      result.current.setTaskId(3);
    });

    expect(result.current.taskId).toBe(3);
  });

  it('should show error message when taskId is not set and handleSubmit is called', async () => {
    const { result } = renderHook(() => useSubmitTeamScore(1, 2));

    await act(async () => {
      result.current.handleSubmit();
    });

    expect(message.error).toHaveBeenCalledWith('Please select a task before submitting.');
  });

  it('should handle successful score submission', async () => {
    (TeamDistributionApi.prototype.submitScore as jest.Mock).mockResolvedValueOnce({});

    const { result } = renderHook(() => useSubmitTeamScore(1, 2));

    act(() => {
      result.current.setTaskId(3);
    });

    await act(async () => {
      result.current.handleSubmit();
    });

    expect(TeamDistributionApi.prototype.submitScore).toHaveBeenCalledWith(1, 2, 3);
    expect(result.current.taskId).toBe(null);
    expect(message.success).toHaveBeenCalledWith('Score submitted successfully.');
  });

  it('should handle failed score submission', async () => {
    (TeamDistributionApi.prototype.submitScore as jest.Mock).mockRejectedValueOnce(new Error('API error'));

    const { result } = renderHook(() => useSubmitTeamScore(1, 2));

    act(() => {
      result.current.setTaskId(3);
    });

    await act(async () => {
      result.current.handleSubmit();
    });

    expect(message.error).toHaveBeenCalledWith('Error occurred while submitting score.');
  });
});
