import { renderHook, act } from '@testing-library/react';
import { CoursesTasksApi, CoursesTaskSolutionsApi, CourseTaskDto } from 'api';
import { AxiosError, AxiosResponse } from 'axios';
import { useSubmitTaskSolution } from './useSubmitTaskSolution';

const COURSE_ID = 10;

const resolvedMock: AxiosResponse = {
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  data: {},
};

const rejectedMock: AxiosError = {
  status: '500',
  config: {},
  name: 'Error',
  message: 'Bad response',
  isAxiosError: true,
} as AxiosError;

describe('useSubmitTaskSolution', () => {
  it('should show modal with course tasks', async () => {
    jest.spyOn(CoursesTasksApi.prototype, 'getCourseTasksWithStudentSolution').mockResolvedValue({
      ...resolvedMock,
      data: generateCourseTasks(),
    });
    const { result } = renderHook(() => useSubmitTaskSolution(COURSE_ID));

    await act(async () => {
      await result.current.showModal();
    });

    expect(result.current.state?.data?.courseTasks).toHaveLength(3);
  });

  it('should save solution', async () => {
    jest.spyOn(CoursesTaskSolutionsApi.prototype, 'createTaskSolution').mockResolvedValue(resolvedMock);
    const { result } = renderHook(() => useSubmitTaskSolution(COURSE_ID));

    await act(async () => {
      await result.current.saveSolution({ courseTaskId: 100, url: 'some-url' });
    });

    expect(result.current.state?.submitted).toBeTruthy();
  });

  it('should close modal', () => {
    const { result } = renderHook(() => useSubmitTaskSolution(COURSE_ID));

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.state).toBeNull();
  });

  describe('should show error', () => {
    it('when getCourseTasksWithStudentSolution request failed', async () => {
      jest.spyOn(CoursesTasksApi.prototype, 'getCourseTasksWithStudentSolution').mockRejectedValue(rejectedMock);
      const { result } = renderHook(() => useSubmitTaskSolution(COURSE_ID));

      await act(async () => {
        await result.current.showModal();
      });

      expect(result.current.state?.errorText).toBeDefined();
    });

    it('when createTaskSolution request failed', async () => {
      jest.spyOn(CoursesTaskSolutionsApi.prototype, 'createTaskSolution').mockRejectedValue(rejectedMock);
      const { result } = renderHook(() => useSubmitTaskSolution(COURSE_ID));

      await act(async () => {
        await result.current.saveSolution({ courseTaskId: 100, url: 'some-url' });
      });

      expect(result.current.state?.errorText).toBeDefined();
    });
  });
});

function generateCourseTasks(count = 3): CourseTaskDto[] {
  return new Array(count).fill({}).map((_, idx) => ({
    id: idx,
    checker: 'mentor',
  })) as CourseTaskDto[];
}
