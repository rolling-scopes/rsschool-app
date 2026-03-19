import { useSubmitTeamScore } from './useSubmitTeamScore';
import { TeamDistributionApi } from '@client/api';
import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

vi.mock('@client/api');

const mockError = vi.fn();
const mockSuccess = vi.fn();

vi.mock('@client/hooks', () => ({
  useMessage: () => ({
    message: {
      error: mockError,
      success: mockSuccess,
    },
  }),
}));

describe('useSubmitTeamScore', () => {
  afterEach(() => {
    vi.clearAllMocks();
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
      await result.current.handleSubmit();
    });

    expect(TeamDistributionApi.prototype.submitScore).toHaveBeenCalledTimes(0);
    expect(result.current.taskId).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(mockSuccess).toHaveBeenCalledTimes(0);
  });

  it('should handle successful score submission', async () => {
    vi.mocked(TeamDistributionApi.prototype.submitScore).mockResolvedValueOnce({});

    const { result } = renderHook(() => useSubmitTeamScore(1, 2));

    act(() => {
      result.current.setTaskId(3);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(TeamDistributionApi.prototype.submitScore).toHaveBeenCalledWith(1, 2, 3);
    expect(result.current.taskId).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('should handle failed score submission', async () => {
    vi.mocked(TeamDistributionApi.prototype.submitScore).mockRejectedValueOnce(new Error('API error'));

    const { result } = renderHook(() => useSubmitTeamScore(1, 2));

    act(() => {
      result.current.setTaskId(3);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(TeamDistributionApi.prototype.submitScore).toHaveBeenCalledWith(1, 2, 3);
    expect(result.current.taskId).toBe(3);
    expect(result.current.loading).toBe(false);
    expect(mockSuccess).toHaveBeenCalledTimes(0);
  });
});
