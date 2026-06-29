import { renderHook } from '@testing-library/react';
import { useRequest } from 'ahooks';
import { useCoursesStats } from './useCourseStats';

// The real ahooks barrel is heavy and its `useRequest` runs runaway retry/backoff timers
// under jsdom (OOMs the worker). Mock the barrel's `useRequest` so we can drive its
// behaviour deterministically and inspect how the hook configures it (service fn,
// `ready` gate, onError handler).
vi.mock('ahooks', () => ({ useRequest: vi.fn() }));

// API boundary: stub getCoursesStats so we can assert the service the hook builds.
const { getCoursesStats } = vi.hoisted(() => ({ getCoursesStats: vi.fn() }));
vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CourseStatsApi: function CourseStatsApi() {
    return { getCoursesStats };
  },
}));

// useMessage is aliased to the mock in vitest.config; capture the error spy.
const { errorSpy } = vi.hoisted(() => ({ errorSpy: vi.fn() }));
vi.mock('@client/hooks', () => ({
  useMessage: () => ({ message: { error: errorSpy } }),
}));

type UseRequestOptions = {
  ready?: boolean;
  refreshDeps?: unknown[];
  retryCount?: number;
  onError?: () => void;
};
const mockedUseRequest = vi.mocked(useRequest);

function lastCall() {
  const calls = mockedUseRequest.mock.calls;
  const [service, options] = calls[calls.length - 1] as [() => Promise<unknown>, UseRequestOptions];
  return { service, options };
}

describe('useCoursesStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseRequest.mockReturnValue({ data: undefined, loading: false } as never);
  });

  it('returns the loading flag and data from useRequest', () => {
    mockedUseRequest.mockReturnValue({ data: { studentsStats: {} }, loading: true } as never);

    const { result } = renderHook(() => useCoursesStats({ ids: [42], year: 0 }));

    expect(result.current.loading).toBe(true);
    expect(result.current.coursesData).toEqual({ studentsStats: {} });
  });

  it('is ready when ids are non-empty', () => {
    renderHook(() => useCoursesStats({ ids: [42], year: 0 }));

    expect(lastCall().options.ready).toBe(true);
  });

  it('is ready when only a year is provided', () => {
    renderHook(() => useCoursesStats({ ids: [], year: 2025 }));

    expect(lastCall().options.ready).toBe(true);
  });

  it('is NOT ready when neither ids nor year are set', () => {
    renderHook(() => useCoursesStats({ ids: [], year: 0 }));

    expect(lastCall().options.ready).toBe(false);
  });

  it('builds a service that calls the API with the ids and year and returns its data', async () => {
    getCoursesStats.mockResolvedValue({ data: { studentsStats: { activeStudentsCount: 5 } } });
    renderHook(() => useCoursesStats({ ids: [1, 2], year: 2025 }));

    const data = await lastCall().service();

    expect(getCoursesStats).toHaveBeenCalledWith([1, 2], 2025);
    expect(data).toEqual({ studentsStats: { activeStudentsCount: 5 } });
  });

  it('rethrows from the service when the API rejects', async () => {
    getCoursesStats.mockRejectedValue(new Error('boom'));
    renderHook(() => useCoursesStats({ ids: [1] }));

    await expect(lastCall().service()).rejects.toThrow('boom');
  });

  it('shows an error message via the onError handler', () => {
    renderHook(() => useCoursesStats({ ids: [1] }));

    lastCall().options.onError?.();

    expect(errorSpy).toHaveBeenCalledWith("Can't load courses data. Please try later.");
  });
});
