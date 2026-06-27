import { act, renderHook, waitFor } from '@testing-library/react';
import { message } from 'antd';
import { CheckerEnum, CourseTaskDtoTypeEnum } from '@client/api';
import { useCourseTaskVerifications } from './useCourseTaskVerifications';

vi.mock('antd', async importOriginal => {
  const actual = await importOriginal<typeof import('antd')>();
  return { ...actual, message: { ...actual.message, error: vi.fn() } };
});

const { getCourseTasksDetailed } = vi.hoisted(() => ({ getCourseTasksDetailed: vi.fn() }));
vi.mock('@client/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/api')>();
  function MockCoursesTasksApi() {}
  MockCoursesTasksApi.prototype.getCourseTasksDetailed = getCourseTasksDetailed;
  return { ...actual, CoursesTasksApi: MockCoursesTasksApi };
});

const { getTaskVerifications } = vi.hoisted(() => ({ getTaskVerifications: vi.fn() }));
vi.mock('@client/services/course', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/services/course')>();
  function MockCourseService() {}
  MockCourseService.prototype.getTaskVerifications = getTaskVerifications;
  return { ...actual, CourseService: MockCourseService };
});

const PAST = '2000-01-01T00:00:00.000Z';
const FUTURE = '2999-01-01T00:00:00.000Z';

function detailedTask(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'AutoTest task',
    checker: CheckerEnum.AutoTest,
    type: CourseTaskDtoTypeEnum.Jstask,
    studentStartDate: PAST,
    studentEndDate: FUTURE,
    maxScore: 100,
    publicAttributes: { maxAttemptsNumber: 3, tresholdPercentage: 80 },
    ...overrides,
  };
}

describe('useCourseTaskVerifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTaskVerifications.mockResolvedValue([]);
  });

  it('returns only auto-test, non-test tasks whose start date has passed', async () => {
    getCourseTasksDetailed.mockResolvedValueOnce({
      data: [
        detailedTask({ id: 1, name: 'Visible' }),
        detailedTask({ id: 2, name: 'WrongChecker', checker: CheckerEnum.CrossCheck }),
        detailedTask({ id: 3, name: 'TestType', type: CourseTaskDtoTypeEnum.Test }),
        detailedTask({ id: 4, name: 'NotStarted', studentStartDate: FUTURE }),
      ],
    });

    const { result } = renderHook(() => useCourseTaskVerifications(42));

    await waitFor(() => expect(result.current.tasks).toHaveLength(1));
    expect(result.current.tasks?.[0]?.name).toBe('Visible');
  });

  it('toggles isExerciseVisible via startTask and finishTask', async () => {
    getCourseTasksDetailed.mockResolvedValueOnce({ data: [] });
    const { result } = renderHook(() => useCourseTaskVerifications(42));

    await waitFor(() => expect(result.current.tasks).toEqual([]));
    expect(result.current.isExerciseVisible).toBe(false);

    act(() => result.current.startTask());
    expect(result.current.isExerciseVisible).toBe(true);

    act(() => result.current.finishTask());
    expect(result.current.isExerciseVisible).toBe(false);
    // finishTask reloads the verifications request
    await waitFor(() => expect(getTaskVerifications).toHaveBeenCalledTimes(2));
  });

  it('reloads the verifications when reload is called', async () => {
    getCourseTasksDetailed.mockResolvedValueOnce({ data: [] });
    const { result } = renderHook(() => useCourseTaskVerifications(42));

    await waitFor(() => expect(getTaskVerifications).toHaveBeenCalledTimes(1));

    act(() => result.current.reload());
    await waitFor(() => expect(getTaskVerifications).toHaveBeenCalledTimes(2));
  });

  it('surfaces a message when the verifications request fails', async () => {
    getCourseTasksDetailed.mockResolvedValueOnce({ data: [] });
    getTaskVerifications.mockReset();
    getTaskVerifications.mockRejectedValueOnce(new Error('boom'));

    renderHook(() => useCourseTaskVerifications(42));

    await waitFor(() => expect(message.error).toHaveBeenCalledWith('boom'));
  });
});
