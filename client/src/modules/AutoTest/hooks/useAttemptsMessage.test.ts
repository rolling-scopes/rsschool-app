import { renderHook } from '@testing-library/react-hooks';
import { SelfEducationPublicAttributes, Verification } from 'services/course';
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
    publicAttributes                                                                              | expected
    ${{ strictAttemptsMode: true, maxAttemptsNumber: MAX_ATTEMPTS, tresholdPercentage: 90 }}      | ${'You must score at least 90% of points to pass. You have only 4 attempts. After limit attempts is over you can get only half of a score.'}
    ${{ strictAttemptsMode: false, maxAttemptsNumber: MAX_ATTEMPTS, tresholdPercentage: 90 }}     | ${'You must score at least 90% of points to pass. You have only 4 attempts.'}
    ${{ maxAttemptsNumber: MAX_ATTEMPTS, tresholdPercentage: 90, oneAttemptPerNumberOfHours: 1 }} | ${'You must score at least 90% of points to pass. You have only 4 attempts. You have only one attempt per 1 hours.'}
    ${{ maxAttemptsNumber: undefined, tresholdPercentage: undefined }}                            | ${'You can submit your solution as many times as you need before the deadline. Without fines. After the deadline, the submission will be closed.'}
  `(
    `should return explanation when ${JSON.stringify(`$publicAttributes`)}`,
    ({ publicAttributes, expected }: { publicAttributes: SelfEducationPublicAttributes; expected: string }) => {
      const task = {
        publicAttributes,
      } as CourseTaskDetailedDto;
      const { explanation } = renderUseAttemptsMessage({ task });

      expect(explanation).toBe(expected);
    },
  );

  it.each`
    type                                           | strictAttemptsMode | verificationsCount | expected
    ${CourseTaskDetailedDtoTypeEnum.Jstask}        | ${undefined}       | ${3}               | ${undefined}
    ${CourseTaskDetailedDtoTypeEnum.Selfeducation} | ${undefined}       | ${3}               | ${"Only 1 attempt left. Be careful, It's your last attempt!"}
    ${CourseTaskDetailedDtoTypeEnum.Selfeducation} | ${undefined}       | ${2}               | ${'2 attempts left.'}
    ${CourseTaskDetailedDtoTypeEnum.Selfeducation} | ${true}            | ${4}               | ${'You have no more attempts.'}
    ${CourseTaskDetailedDtoTypeEnum.Selfeducation} | ${undefined}       | ${4}               | ${'Limit of "free" attempts is over. Now you can get only half of a score.'}
  `(
    `should return left attempts count message when verifications count is $verificationsCount and max attempts is ${MAX_ATTEMPTS}`,
    ({
      type,
      verificationsCount,
      strictAttemptsMode,
      expected,
    }: {
      type: CourseTaskDetailedDtoTypeEnum;
      verificationsCount: number;
      strictAttemptsMode: boolean;
      expected: string;
    }) => {
      const task = {
        type,
        publicAttributes: {
          maxAttemptsNumber: MAX_ATTEMPTS,
          strictAttemptsMode,
        },
      } as CourseTaskDetailedDto;
      const { attemptsLeftMessage } = renderUseAttemptsMessage({ task, verificationsCount });

      expect(attemptsLeftMessage).toBe(expected);
    },
  );

  it('should allow submit when strict mode is false and attempts count is 0', () => {
    const task = {
      publicAttributes: {
        maxAttemptsNumber: MAX_ATTEMPTS,
        strictAttemptsMode: false,
      },
    } as CourseTaskDetailedDto;
    const { allowStartTask: allowSubmit } = renderUseAttemptsMessage({ task, verificationsCount: MAX_ATTEMPTS });

    expect(allowSubmit).toBeTruthy();
  });

  it('should not allow submit when strict mode is true and attempts count is 0', () => {
    const task = {
      publicAttributes: {
        maxAttemptsNumber: MAX_ATTEMPTS,
        strictAttemptsMode: true,
      },
    } as CourseTaskDetailedDto;
    const { allowStartTask: allowSubmit } = renderUseAttemptsMessage({ task, verificationsCount: MAX_ATTEMPTS });

    expect(allowSubmit).toBeFalsy();
  });
});
