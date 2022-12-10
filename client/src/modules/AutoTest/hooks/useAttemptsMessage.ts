import { useMemo } from 'react';
import { CourseTaskDetailedDto, CourseTaskDetailedDtoTypeEnum } from 'api';
import { SelfEducationPublicAttributes, Verification } from 'services/course';

export function useAttemptsMessage(courseTask: CourseTaskDetailedDto, verifications: Verification[]) {
  const { publicAttributes, type } = courseTask;
  const { maxAttemptsNumber, tresholdPercentage, strictAttemptsMode } =
    (publicAttributes as SelfEducationPublicAttributes) || {};

  const attemptsCount = useMemo(() => {
    const leftCount = maxAttemptsNumber - verifications?.length;
    return leftCount > 0 ? leftCount : 0;
  }, [maxAttemptsNumber, verifications?.length]);

  const explanation = useMemo(() => {
    if (type === CourseTaskDetailedDtoTypeEnum.Codewars || type === CourseTaskDetailedDtoTypeEnum.Jstask) {
      return 'You can submit your solution as many times as you need before the deadline. Without fines. After the deadline, the submission will be closed.';
    }

    let str = `You must score at least ${tresholdPercentage}% of points to pass. You have only ${maxAttemptsNumber} attempts.`;

    if (strictAttemptsMode) {
      str += ' After limit attempts is over you can get only half of a score.';
    }

    // TODO: fix You must score at least undefined% of points to pass. You have only undefined attempts.
    return str;
  }, [maxAttemptsNumber, tresholdPercentage, strictAttemptsMode]);

  const attemptsLeftMessage = useMemo(() => {
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

  return {
    attemptsCount,
    explanation,
    attemptsLeftMessage,
  };
}
