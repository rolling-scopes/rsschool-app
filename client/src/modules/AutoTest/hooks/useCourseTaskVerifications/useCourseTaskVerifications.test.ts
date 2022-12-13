import { renderHook, act } from '@testing-library/react-hooks';
import { Verification } from 'services/course';
import { useCourseTaskVerifications } from './useCourseTaskVerifications';
import * as reactUse from 'react-use';
import { CourseTaskDetailedDto } from 'api';

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
      jest.spyOn(reactUse, 'useAsync').mockImplementationOnce(() => ({ value: verifications, loading: false }));
      const courseTask = { id: 100 } as CourseTaskDetailedDto;

      const { task } = renderUseCourseTaskVerifications(courseTask);

      expect(task?.verifications).toHaveLength(expectedLength);
    },
  );

  it('should reload verifications when task is finished', async () => {
    const asyncMock = jest.fn().mockImplementation(() => ({ value: VERIFICATIONS_MOCK, loading: false }));
    jest.spyOn(reactUse, 'useAsync').mockImplementationOnce(asyncMock);
    const courseTask = { id: 100 } as CourseTaskDetailedDto;

    const { finishTask } = renderUseCourseTaskVerifications(courseTask);

    await act(async () => {
      await finishTask();
    });

    expect(asyncMock).toHaveBeenCalled();
  });

  it('should hide exercise when task is finished', async () => {
    const asyncMock = jest.fn().mockImplementation(() => ({ value: VERIFICATIONS_MOCK, loading: false }));
    jest.spyOn(reactUse, 'useAsync').mockImplementationOnce(asyncMock);
    const courseTask = { id: 100 } as CourseTaskDetailedDto;
    const { finishTask, isExerciseVisible } = renderUseCourseTaskVerifications(courseTask);

    await act(async () => {
      await finishTask();
    });

    expect(isExerciseVisible).toBeFalsy();
  });
});
