import { renderHook } from '@testing-library/react-hooks';
import { Verification } from 'services/course';
import { useCourseTaskVerifications } from './useCourseTaskVerifications';
import * as reactUse from 'react-use';

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
    verifications         | courseTaskId | expectedLength
    ${[]}                 | ${undefined} | ${0}
    ${VERIFICATIONS_MOCK} | ${undefined} | ${4}
    ${VERIFICATIONS_MOCK} | ${100}       | ${2}
  `(
    'should return $expectedLength verifications when courseTaskId is $courseTaskId',
    async ({
      verifications,
      courseTaskId,
      expectedLength,
    }: {
      verifications: Verification[];
      courseTaskId: number;
      expectedLength: number;
    }) => {
      jest.spyOn(reactUse, 'useAsync').mockImplementationOnce(() => ({ value: verifications, loading: false }));
      const { result } = renderHook(() => useCourseTaskVerifications(10, courseTaskId));

      expect(result.current.verifications).toHaveLength(expectedLength);
    },
  );
});
