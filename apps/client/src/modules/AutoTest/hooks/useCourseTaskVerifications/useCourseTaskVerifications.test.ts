import { renderHook, act } from '@testing-library/react';
import { Verification } from 'services/course';
import { useCourseTaskVerifications } from './useCourseTaskVerifications';
import { useAsync } from 'react-use';
import { CourseTaskDetailedDto } from 'api';

jest.mock('react-use');

const VERIFICATIONS_MOCK: Verification[] = [
  {
    courseTaskId: 100,
  },
  {
    courseTaskId: 100,
  },
  {
    courseTaskId: 200,
  },
  {
    courseTaskId: 300,
  },
] as Verification[];

function renderUseCourseTaskVerifications(courseTask: CourseTaskDetailedDto | CourseTaskDetailedDto[]) {
  const { result } = renderHook(() => useCourseTaskVerifications(10, courseTask));

  return { ...result.current };
}

describe('useCourseTaskVerifications', () => {
  it.each`
    verifications         | expectedLength
    ${[]}                 | ${0}
    ${VERIFICATIONS_MOCK} | ${2}
  `(
    'should return $expectedLength verifications',
    async ({ verifications, expectedLength }: { verifications: Verification[]; expectedLength: number }) => {
      (useAsync as jest.Mock).mockReturnValueOnce({ value: verifications, loading: false });
      const courseTask = { id: 100 } as CourseTaskDetailedDto;

      const { task } = renderUseCourseTaskVerifications(courseTask);

      expect(task?.verifications).toHaveLength(expectedLength);
    },
  );

  it('should reload verifications when task is finished', async () => {
    (useAsync as jest.Mock).mockReturnValue({ value: VERIFICATIONS_MOCK, loading: false });
    const courseTask = { id: 100 } as CourseTaskDetailedDto;

    const { finishTask } = renderUseCourseTaskVerifications(courseTask);

    await act(async () => {
      finishTask();
    });

    expect(useAsync).toHaveBeenCalled();
  });

  it('should hide exercise when task is finished', async () => {
    (useAsync as jest.Mock).mockReturnValue({ value: VERIFICATIONS_MOCK, loading: false });
    const courseTask = { id: 100 } as CourseTaskDetailedDto;
    const { finishTask, isExerciseVisible } = renderUseCourseTaskVerifications(courseTask);

    await act(async () => {
      finishTask();
    });

    expect(isExerciseVisible).toBeFalsy();
  });
});
