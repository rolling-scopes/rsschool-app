import { CourseTask } from '@entities/courseTask';

export const isTaskNeededToStart = ({ crossCheckStatus, studentEndDate }: CourseTask) => {
  const currTimestampUTC = Date.now();
  const studentEndDateTimestampUTC = Date.parse(studentEndDate as string);
  return crossCheckStatus === 'initial' && currTimestampUTC > studentEndDateTimestampUTC;
};

export const isTaskNeededToFinish = ({ crossCheckStatus, crossCheckEndDate }: CourseTask) => {
  const currTimestampUTC = Date.now();
  const crossCheckEndDateTimestampUTC = Date.parse(crossCheckEndDate);
  return crossCheckStatus === 'distributed' && currTimestampUTC > crossCheckEndDateTimestampUTC;
};
