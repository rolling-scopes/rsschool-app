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
      const { result } = renderHook(() => useCourseTaskVerifications(10, courseTask));

      expect(result.current.task.verifications).toHaveLength(expectedLength);
    },
  );

  it('should reload verifications', async () => {
    const asyncMock = jest.fn().mockImplementation(() => ({ value: VERIFICATIONS_MOCK, loading: false }));
    jest.spyOn(reactUse, 'useAsync').mockImplementationOnce(asyncMock);
    const courseTask = { id: 100 } as CourseTaskDetailedDto;
    const { result } = renderHook(() => useCourseTaskVerifications(10, courseTask));

    await act(async () => {
      await result.current.reloadVerifications();
    });

    expect(asyncMock).toHaveBeenCalled();
  });
});
