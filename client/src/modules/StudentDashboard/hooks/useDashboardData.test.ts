import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CoursesScheduleApi,
  CoursesTasksApi,
  CourseStatsApi,
  StudentsApi,
  CourseScheduleItemDtoStatusEnum,
  CourseScheduleItemDtoTypeEnum,
} from '@client/api';
import { UserService } from '@client/services/user';
import { useDashboardData } from './useDashboardData';

const ok = <T>(data: T) => ({ status: 200, statusText: 'OK', headers: {}, config: {}, data });

const COURSE_ID = 7;
const GITHUB_ID = 'student-1';

function stubSchedule(items: unknown[]) {
  vi.spyOn(CoursesScheduleApi.prototype, 'getSchedule').mockResolvedValue(ok(items) as never);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useDashboardData', () => {
  it('aggregates summary, schedule, stats and computes maxCourseScore when everything is populated', async () => {
    vi.spyOn(StudentsApi.prototype, 'getStudentSummary').mockResolvedValue(ok({ totalScore: 10 }) as never);
    vi.spyOn(CoursesTasksApi.prototype, 'getCourseTasks').mockResolvedValue(
      ok([
        { id: 1, name: 'Task A', maxScore: 100, scoreWeight: 1 },
        { id: 2, name: 'Task B', maxScore: 40, scoreWeight: 0.5 },
      ]) as never,
    );
    vi.spyOn(CourseStatsApi.prototype, 'getCourseStats').mockResolvedValue(ok({ activeStudentsCount: 5 }) as never);
    vi.spyOn(CoursesTasksApi.prototype, 'getAvailableCrossCheckReviewStats').mockResolvedValue(
      ok([{ id: 1 }]) as never,
    );
    // getProfileInfo returns the profile object directly (no axios envelope).
    vi.spyOn(UserService.prototype, 'getProfileInfo').mockResolvedValue({
      studentStats: [{ courseId: COURSE_ID, tasks: [{ name: 'Task A', comment: 'good', githubPrUri: 'pr-1' }] }],
    } as never);
    stubSchedule([
      {
        name: 'Task A',
        type: CourseScheduleItemDtoTypeEnum.CourseTask,
        status: CourseScheduleItemDtoStatusEnum.Available,
      },
      {
        name: 'Lecture',
        type: CourseScheduleItemDtoTypeEnum.CourseEvent,
        status: CourseScheduleItemDtoStatusEnum.Done,
      },
      {
        name: 'Old Task',
        type: CourseScheduleItemDtoTypeEnum.CourseTask,
        status: CourseScheduleItemDtoStatusEnum.Archived,
      },
    ]);

    const { result } = renderHook(() => useDashboardData(COURSE_ID, GITHUB_ID));

    await waitFor(() => expect(result.current.data).toBeDefined());

    const data = result.current.data!;
    // maxCourseScore = round(100*1 + 40*0.5) = 120.
    expect(data.maxCourseScore).toBe(120);
    // nextEvents keeps only Available items.
    expect(data.nextEvents).toHaveLength(1);
    expect(data.nextEvents[0].name).toBe('Task A');
    // tasksDetailCurrentCourse picked the matching course's tasks (L42 found branch).
    expect(data.tasksDetailCurrentCourse).toHaveLength(1);
    // Archived status is omitted from tasksByStatus.
    expect(data.tasksByStatus[CourseScheduleItemDtoStatusEnum.Archived]).toBeUndefined();
    // Course-task schedule item merged the matching task detail (L50 found branch).
    expect(data.tasksByStatus[CourseScheduleItemDtoStatusEnum.Available]?.[0]).toMatchObject({
      name: 'Task A',
      comment: 'good',
      githubPrUri: 'pr-1',
    });
  });

  it('falls back to defaults when the course/task details are missing or maxScore is null', async () => {
    vi.spyOn(StudentsApi.prototype, 'getStudentSummary').mockResolvedValue(ok({}) as never);
    vi.spyOn(CoursesTasksApi.prototype, 'getCourseTasks').mockResolvedValue(
      // maxScore null -> exercises the `?? 0` fallback (L60).
      ok([{ id: 9, name: 'No Max', maxScore: null, scoreWeight: 2 }]) as never,
    );
    vi.spyOn(CourseStatsApi.prototype, 'getCourseStats').mockResolvedValue(ok({}) as never);
    vi.spyOn(CoursesTasksApi.prototype, 'getAvailableCrossCheckReviewStats').mockResolvedValue(ok([]) as never);
    // studentStats has no entry for COURSE_ID -> find() returns undefined -> `?? []` (L42).
    vi.spyOn(UserService.prototype, 'getProfileInfo').mockResolvedValue({
      studentStats: [{ courseId: 999, tasks: [{ name: 'Other', comment: 'x' }] }],
    } as never);
    stubSchedule([
      // A course task whose name matches nothing in tasksDetail -> `?? {}` (L50 false branch).
      {
        name: 'Lonely Task',
        type: CourseScheduleItemDtoTypeEnum.CourseTask,
        status: CourseScheduleItemDtoStatusEnum.Future,
      },
    ]);

    const { result } = renderHook(() => useDashboardData(COURSE_ID, GITHUB_ID));

    await waitFor(() => expect(result.current.data).toBeDefined());

    const data = result.current.data!;
    expect(data.maxCourseScore).toBe(0); // null maxScore -> 0 contribution.
    expect(data.nextEvents).toHaveLength(0); // none Available.
    expect(data.tasksDetailCurrentCourse).toEqual([]); // no matching course.
    const futureTasks = data.tasksByStatus[CourseScheduleItemDtoStatusEnum.Future];
    expect(futureTasks?.[0]).toMatchObject({ name: 'Lonely Task' });
    // No matching detail -> comment/githubPrUri stay undefined.
    expect(futureTasks?.[0].comment).toBeUndefined();
  });

  it('handles a missing studentStats array (optional chaining on find)', async () => {
    vi.spyOn(StudentsApi.prototype, 'getStudentSummary').mockResolvedValue(ok({}) as never);
    vi.spyOn(CoursesTasksApi.prototype, 'getCourseTasks').mockResolvedValue(ok([]) as never);
    vi.spyOn(CourseStatsApi.prototype, 'getCourseStats').mockResolvedValue(ok({}) as never);
    vi.spyOn(CoursesTasksApi.prototype, 'getAvailableCrossCheckReviewStats').mockResolvedValue(ok([]) as never);
    // studentStats undefined -> `studentStats?.find` short-circuits -> `?? []`.
    vi.spyOn(UserService.prototype, 'getProfileInfo').mockResolvedValue({} as never);
    stubSchedule([]);

    const { result } = renderHook(() => useDashboardData(COURSE_ID, GITHUB_ID));

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data!.tasksDetailCurrentCourse).toEqual([]);
    expect(result.current.data!.maxCourseScore).toBe(0);
  });
});
