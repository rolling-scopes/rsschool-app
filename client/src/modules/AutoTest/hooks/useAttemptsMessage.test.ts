import { renderHook } from '@testing-library/react-hooks';
import { Verification } from 'services/course';
import { CourseTaskDetailedDto, CourseTaskDetailedDtoTypeEnum } from 'api';
import { useAttemptsMessage } from './useAttemptsMessage';

const MAX_ATTEMPTS = 4;
function renderUseAttemptsMessage({
  verificationsCount = 0,
  task,
}: {
  verificationsCount?: number;
  task?: CourseTaskDetailedDto;
}) {
  const courseTask = {
    publicAttributes: {
      maxAttemptsNumber: MAX_ATTEMPTS,
    },
  } as CourseTaskDetailedDto;
  const verifications = new Array(verificationsCount).fill({}) as Verification[];

  const {
    result: { current },
  } = renderHook(() => useAttemptsMessage(task ?? courseTask, verifications));

  return { ...current };
}

describe('useAttemptsMessage', () => {
  it.each`
    verificationsCount | attemptsLeft
    ${0}               | ${4}
    ${1}               | ${3}
    ${4}               | ${0}
    ${10}              | ${0}
  `(
    `should return left attempts count equal to $attemptsLeft when verifications count is $verificationsCount and max attempts is ${MAX_ATTEMPTS}`,
    ({ verificationsCount, attemptsLeft }: { verificationsCount: number; attemptsLeft: number }) => {
      const { attemptsCount } = renderUseAttemptsMessage({ verificationsCount });

      expect(attemptsCount).toBe(attemptsLeft);
    },
  );

  it.each`
    strictAttemptsMode | type                                           | expected
    ${true}            | ${CourseTaskDetailedDtoTypeEnum.Selfeducation} | ${'You must score at least 90% of points to pass. You have only 4 attempts. After limit attempts is over you can get only half of a score.'}
    ${false}           | ${CourseTaskDetailedDtoTypeEnum.Selfeducation} | ${'You must score at least 90% of points to pass. You have only 4 attempts.'}
    ${undefined}       | ${CourseTaskDetailedDtoTypeEnum.Jstask}        | ${'You can submit your solution as many times as you need before the deadline. Without fines. After the deadline, the submission will be closed.'}
    ${undefined}       | ${CourseTaskDetailedDtoTypeEnum.Codewars}      | ${'You can submit your solution as many times as you need before the deadline. Without fines. After the deadline, the submission will be closed.'}
  `(
    'should return explanation when task type is $type and strict mode is $strictAttemptsMode',
    ({
      strictAttemptsMode,
      expected,
      type,
    }: {
      strictAttemptsMode: boolean;
      expected: string;
      type: CourseTaskDetailedDtoTypeEnum;
    }) => {
      const task = {
        type,
        publicAttributes: {
          maxAttemptsNumber: MAX_ATTEMPTS,
          tresholdPercentage: 90,
          strictAttemptsMode,
        },
      } as CourseTaskDetailedDto;
      const { explanation } = renderUseAttemptsMessage({ task });

      expect(explanation).toBe(expected);
    },
  );

  it.each`
    strictAttemptsMode | verificationsCount | expected
    ${undefined}       | ${3}               | ${"Only 1 attempt left. Be careful, It's your last attempt!"}
    ${undefined}       | ${2}               | ${'2 attempts left.'}
    ${true}            | ${4}               | ${'You have no more attempts.'}
    ${undefined}       | ${4}               | ${'Limit of "free" attempts is over. Now you can get only half of a score.'}
  `(
    `should return left attempts count message when verifications count is $verificationsCount and max attempts is ${MAX_ATTEMPTS}`,
    ({
      verificationsCount,
      strictAttemptsMode,
      expected,
    }: {
      verificationsCount: number;
      strictAttemptsMode: boolean;
      expected: string;
    }) => {
      const task = {
        publicAttributes: {
          maxAttemptsNumber: MAX_ATTEMPTS,
          strictAttemptsMode,
        },
      } as CourseTaskDetailedDto;
      const { attemptsLeftMessage } = renderUseAttemptsMessage({ task, verificationsCount });

      expect(attemptsLeftMessage).toBe(expected);
    },
  );
});
