import { act, renderHook, waitFor } from '@testing-library/react';
import { useExpelledStats } from './useExpelledStats';

const { getCourseExpelledStats, deleteExpelledStat } = vi.hoisted(() => ({
  getCourseExpelledStats: vi.fn(),
  deleteExpelledStat: vi.fn(),
}));

vi.mock('@client/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/api')>();
  function MockCourseStatsApi() {}
  MockCourseStatsApi.prototype.getCourseExpelledStats = getCourseExpelledStats;
  MockCourseStatsApi.prototype.deleteExpelledStat = deleteExpelledStat;
  return { ...actual, CourseStatsApi: MockCourseStatsApi };
});

describe('useExpelledStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCourseExpelledStats.mockResolvedValue({ data: [] });
    deleteExpelledStat.mockResolvedValue({});
  });

  it('does not fetch while there is no courseId (request not ready)', async () => {
    renderHook(() => useExpelledStats(undefined));

    await new Promise(r => setTimeout(r, 10));
    expect(getCourseExpelledStats).not.toHaveBeenCalled();
  });

  it('fetches and exposes the expelled stats once a courseId is provided', async () => {
    const rows = [{ id: '1', githubId: 'student' }];
    getCourseExpelledStats.mockResolvedValueOnce({ data: rows });
    const { result } = renderHook(() => useExpelledStats(100));

    await waitFor(() => expect(result.current.data).toEqual(rows));
    expect(getCourseExpelledStats).toHaveBeenCalledWith(100);
  });

  it('deletes a stat and refreshes the list afterwards', async () => {
    getCourseExpelledStats.mockResolvedValue({ data: [{ id: '1' }] });
    const { result } = renderHook(() => useExpelledStats(100));

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(getCourseExpelledStats).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.handleDelete('1');
    });

    expect(deleteExpelledStat).toHaveBeenCalledWith('1');
    // onSuccess => refresh re-runs the fetch
    await waitFor(() => expect(getCourseExpelledStats).toHaveBeenCalledTimes(2));
  });

  it('exposes the error when the fetch rejects', async () => {
    getCourseExpelledStats.mockRejectedValueOnce(new Error('stats failed'));
    const { result } = renderHook(() => useExpelledStats(100));

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.error?.message).toBe('stats failed');
  });
});
