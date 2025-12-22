import { renderHook } from '@testing-library/react';
import { SelfEducationPublicAttributes, Verification } from 'services/course';
import { CourseTaskDetailedDtoTypeEnum } from '@client/api';
import { useAttemptsMessage } from './useAttemptsMessage';
import { CourseTaskVerifications } from 'modules/AutoTest/types';
import dayjs from 'dayjs';

const MAX_ATTEMPTS = 4;
function renderUseAttemptsMessage({
  verificationsCount = 0,
  task,
  verificationCreatedDate,
}: {
  verificationsCount?: number;
  task?: CourseTaskVerifications;
  verificationCreatedDate?: string;
}) {
  const verifications = new Array(verificationsCount).fill({
    createdDate: dayjs(verificationCreatedDate).add(2, 'h').format(),
  }) as Verification[];

  let courseTask = {
    publicAttributes: {
      maxAttemptsNumber: MAX_ATTEMPTS,
    },
    verifications,
  } as CourseTaskVerifications;

  if (task) {
    courseTask = { ...task, verifications };
  }

  const {
    result: { current },
  } = renderHook(() => useAttemptsMessage(courseTask));

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

  it('should return left attempts count equal to Infinity when max attempts was not provided', () => {
    const task = {
      type: CourseTaskDetailedDtoTypeEnum.Jstask,
    } as CourseTaskVerifications;
    const { attemptsCount } = renderUseAttemptsMessage({ task });

    expect(attemptsCount).toBe(Infinity);
  });

  it.each`
    publicAttributes                                                                              | verificationsCount | expected
    ${{ strictAttemptsMode: true, maxAttemptsNumber: MAX_ATTEMPTS, tresholdPercentage: 90 }}      | ${0}               | ${'You must score at least 90% of points to pass. You have only 4 attempts.'}
    ${{ strictAttemptsMode: false, maxAttemptsNumber: MAX_ATTEMPTS, tresholdPercentage: 90 }}     | ${0}               | ${'You must score at least 90% of points to pass. You have only 4 attempts. After limit attempts is over you can get only half of a score.'}
    ${{ maxAttemptsNumber: MAX_ATTEMPTS, tresholdPercentage: 90, oneAttemptPerNumberOfHours: 1 }} | ${0}               | ${'You must score at least 90% of points to pass. You have only 4 attempts. After limit attempts is over you can get only half of a score. You have only one attempt per 1 hours.'}
    ${{ maxAttemptsNumber: MAX_ATTEMPTS, tresholdPercentage: 90, oneAttemptPerNumberOfHours: 2 }} | ${1}               | ${'You must score at least 90% of points to pass. You have only 4 attempts. After limit attempts is over you can get only half of a score. You have only one attempt per 2 hours. Next submit is possible in'}
    ${{ maxAttemptsNumber: undefined, tresholdPercentage: undefined }}                            | ${0}               | ${'You can submit your solution as many times as you need before the deadline. Without fines. After the deadline, the submission will be closed.'}
  `(
    `should return explanation when ${JSON.stringify(`$publicAttributes`)}`,
    ({
      publicAttributes,
      verificationsCount,
      expected,
    }: {
      publicAttributes: SelfEducationPublicAttributes;
      verificationsCount: number;
      expected: string;
    }) => {
      const task = {
        publicAttributes,
      } as CourseTaskVerifications;
      const { explanation } = renderUseAttemptsMessage({ task, verificationsCount });

      expect(explanation).toMatch(new RegExp(expected, 'i'));
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
      } as CourseTaskVerifications;
      const { attemptsLeftMessage } = renderUseAttemptsMessage({ task, verificationsCount });

      expect(attemptsLeftMessage).toBe(expected);
    },
  );

  describe('should allow to start task', () => {
    it('when strict mode is false and attempts count is 0', () => {
      const task = {
        publicAttributes: {
          maxAttemptsNumber: MAX_ATTEMPTS,
          strictAttemptsMode: false,
        },
      } as CourseTaskVerifications;
      const { allowStartTask } = renderUseAttemptsMessage({ task, verificationsCount: MAX_ATTEMPTS });

      expect(allowStartTask).toBeTruthy();
    });

    it('when deadline has not passed', () => {
      const task = {
        studentEndDate: dayjs().add(7, 'd').format(),
      } as CourseTaskVerifications;
      const { allowStartTask } = renderUseAttemptsMessage({ task, verificationsCount: MAX_ATTEMPTS });

      expect(allowStartTask).toBeTruthy();
    });

    it('when attempts per hours are not over', () => {
      const task = {
        studentEndDate: dayjs().add(7, 'd').format(),
        publicAttributes: {
          oneAttemptPerNumberOfHours: 1,
        },
      } as CourseTaskVerifications;
      const { allowStartTask } = renderUseAttemptsMessage({
        task,
        verificationsCount: 1,
        verificationCreatedDate: dayjs().subtract(4, 'h').format(),
      });

      expect(allowStartTask).toBeTruthy();
    });
  });

  describe('should not allow to start task', () => {
    it('when strict mode is true and attempts count is 0', () => {
      const task = {
        publicAttributes: {
          maxAttemptsNumber: MAX_ATTEMPTS,
          strictAttemptsMode: true,
        },
      } as CourseTaskVerifications;
      const { allowStartTask } = renderUseAttemptsMessage({ task, verificationsCount: MAX_ATTEMPTS });

      expect(allowStartTask).toBeFalsy();
    });

    it('when deadline has passed', () => {
      const task = {
        studentEndDate: '1970-01-01T00:00:00.000Z',
      } as CourseTaskVerifications;
      const { allowStartTask } = renderUseAttemptsMessage({ task });

      expect(allowStartTask).toBeFalsy();
    });

    it('when attempts per hours are over', () => {
      const task = {
        studentEndDate: dayjs().add(7, 'd').format(),
        publicAttributes: {
          oneAttemptPerNumberOfHours: 3,
        },
      } as CourseTaskVerifications;
      const { allowStartTask } = renderUseAttemptsMessage({ task, verificationsCount: 1 });

      expect(allowStartTask).toBeFalsy();
    });
  });

  describe('should not allow to check answers', () => {
    it('when deadline is not passed', () => {
      const task = {
        studentEndDate: dayjs().add(7, 'd').format(),
      } as CourseTaskVerifications;
      const { allowCheckAnswers } = renderUseAttemptsMessage({ task });

      expect(allowCheckAnswers).toBeFalsy();
    });

    it('when deadline is passed and attempts were not taken', () => {
      const task = {
        studentEndDate: dayjs().subtract(7, 'd').format(),
        publicAttributes: {
          maxAttemptsNumber: 5,
        },
      } as CourseTaskVerifications;
      const { allowCheckAnswers } = renderUseAttemptsMessage({ task, verificationsCount: 0 });

      expect(allowCheckAnswers).toBeFalsy();
    });
  });

  describe('should allow to check answers', () => {
    it('when deadline is passed and attempts were taken', () => {
      const task = {
        studentEndDate: dayjs().subtract(7, 'd').format(),
        publicAttributes: {
          maxAttemptsNumber: 5,
        },
      } as CourseTaskVerifications;
      const { allowCheckAnswers } = renderUseAttemptsMessage({ task, verificationsCount: 3 });

      expect(allowCheckAnswers).toBeTruthy();
    });
  });
});
