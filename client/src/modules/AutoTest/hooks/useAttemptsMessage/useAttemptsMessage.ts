import { useMemo } from 'react';
import { CourseTaskDetailedDtoTypeEnum } from '@client/api';
import { CourseTaskVerifications } from 'modules/AutoTest/types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function useAttemptsMessage(courseTask: CourseTaskVerifications) {
  const { publicAttributes, type, verifications, studentEndDate } = courseTask;
  const { maxAttemptsNumber, tresholdPercentage, strictAttemptsMode, oneAttemptPerNumberOfHours } =
    publicAttributes || {};

  const attemptsCount = useMemo((): number => {
    if (maxAttemptsNumber) {
      const leftCount = maxAttemptsNumber - (verifications?.length || 0);
      return leftCount > 0 ? leftCount : 0;
    }

    return Infinity;
  }, [maxAttemptsNumber, verifications?.length]);

  const isDeadlinePassed = useMemo(() => {
    const now = dayjs();
    const endDate = dayjs(studentEndDate);

    return now.isAfter(endDate);
  }, [studentEndDate]);

  const timeToNextSubmit = useMemo((): number => {
    const [lastAttempt] = verifications || [];
    const lastAttemptTime = lastAttempt?.createdDate;

    if (oneAttemptPerNumberOfHours && lastAttemptTime) {
      const diff = dayjs(lastAttemptTime).diff(dayjs().subtract(oneAttemptPerNumberOfHours, 'hour'));

      if (diff < 0) {
        return 0;
      }

      return diff;
    }

    return 0;
  }, [oneAttemptPerNumberOfHours, verifications]);

  const explanation = useMemo(() => {
    if (tresholdPercentage && maxAttemptsNumber) {
      let str = `You must score at least ${tresholdPercentage}% of points to pass. You have only ${maxAttemptsNumber} attempts.`;

      if (!strictAttemptsMode) {
        str += ' After limit attempts is over you can get only half of a score.';
      }

      if (oneAttemptPerNumberOfHours) {
        str += ` You have only one attempt per ${oneAttemptPerNumberOfHours} hours.`;
      }

      if (timeToNextSubmit !== 0 && attemptsCount > 0) {
        str += ` Next submit is possible in ${dayjs.utc(timeToNextSubmit).format('HH:mm:ss')}`;
      }

      return str;
    }

    return 'You can submit your solution as many times as you need before the deadline. Without fines. After the deadline, the submission will be closed.';
  }, [maxAttemptsNumber, tresholdPercentage, strictAttemptsMode, timeToNextSubmit]);

  const attemptsLeftMessage = useMemo((): string | undefined => {
    if (type !== CourseTaskDetailedDtoTypeEnum.Selfeducation || isDeadlinePassed) {
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
    if (isDeadlinePassed || !!timeToNextSubmit || (strictAttemptsMode && !attemptsCount)) {
      return false;
    }

    return true;
  }, [strictAttemptsMode, attemptsCount, isDeadlinePassed]);

  const allowCheckAnswers = useMemo(
    () => isDeadlinePassed && verifications?.length > 0,
    [isDeadlinePassed, verifications?.length],
  );

  return {
    attemptsCount,
    explanation,
    attemptsLeftMessage,
    allowStartTask,
    allowCheckAnswers,
  };
}
