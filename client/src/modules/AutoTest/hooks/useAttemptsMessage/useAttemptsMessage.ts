import { useMemo } from 'react';
import { CourseTaskDetailedDtoTypeEnum } from 'api';
import { SelfEducationPublicAttributes } from 'services/course';
import { CourseTaskVerifications } from '../../types';

export function useAttemptsMessage(courseTask: CourseTaskVerifications) {
  const { publicAttributes, type, verifications } = courseTask;
  const { maxAttemptsNumber, tresholdPercentage, strictAttemptsMode, oneAttemptPerNumberOfHours } =
    (publicAttributes as SelfEducationPublicAttributes) || {};

  const attemptsCount = useMemo((): number => {
    const leftCount = maxAttemptsNumber - verifications?.length;
    return leftCount > 0 ? leftCount : 0;
  }, [maxAttemptsNumber, verifications?.length]);

  const explanation = useMemo(() => {
    if (tresholdPercentage && maxAttemptsNumber) {
      let str = `You must score at least ${tresholdPercentage}% of points to pass. You have only ${maxAttemptsNumber} attempts.`;

      if (strictAttemptsMode) {
        str += ' After limit attempts is over you can get only half of a score.';
      }

      if (oneAttemptPerNumberOfHours) {
        str += ` You have only one attempt per ${oneAttemptPerNumberOfHours} hours.`;
      }

      return str;
    }

    return 'You can submit your solution as many times as you need before the deadline. Without fines. After the deadline, the submission will be closed.';
  }, [maxAttemptsNumber, tresholdPercentage, strictAttemptsMode]);

  const attemptsLeftMessage = useMemo((): string | undefined => {
    if (type !== CourseTaskDetailedDtoTypeEnum.Selfeducation) {
      return;
    }

    if (attemptsCount === 1) {
      return `Only 1 attempt left. Be careful, It's your last attempt!`;
    }

    if (attemptsCount > 1) {
      return `${attemptsCount} attempts left.`;
    }

    if (strictAttemptsMode) {
      return 'You have no more attempts.';
    }

    return 'Limit of "free" attempts is over. Now you can get only half of a score.';
  }, [attemptsCount, strictAttemptsMode]);

  const allowStartTask = useMemo(() => {
    if (!strictAttemptsMode) {
      return true;
    }

    if (strictAttemptsMode && !attemptsCount) {
      return false;
    }
  }, [strictAttemptsMode]);

  return {
    attemptsCount,
    explanation,
    attemptsLeftMessage,
    allowStartTask,
  };
}
