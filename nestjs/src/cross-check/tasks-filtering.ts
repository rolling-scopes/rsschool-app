import { CourseTask, CrossCheckStatus } from '@entities/courseTask';

export const isTaskNeededToStart = ({ crossCheckStatus, studentEndDate }: CourseTask) => {
  const currTimestampUTC = Date.now();
  const studentEndDateTimestampUTC = Date.parse(studentEndDate as string);
  return crossCheckStatus === CrossCheckStatus.Initial && currTimestampUTC > studentEndDateTimestampUTC;
};

export const isTaskNeededToFinish = ({ crossCheckStatus, crossCheckEndDate }: CourseTask) => {
  const currTimestampUTC = Date.now();
  if (!crossCheckEndDate) return false;
  const crossCheckEndDateTimestampUTC =
    typeof crossCheckEndDate === 'string' ? Date.parse(crossCheckEndDate) : crossCheckEndDate;
  return crossCheckStatus === CrossCheckStatus.Distributed && currTimestampUTC > crossCheckEndDateTimestampUTC;
};
