import { CourseTask } from '@entities/courseTask';

export const isTaskNeededToStart = ({ crossCheckState, studentEndDate }: CourseTask) => {
  const currTimestampUTC = Date.now();
  const studentEndDateTimestampUTC = Date.parse(studentEndDate as string);
  return crossCheckState === 'initial' && currTimestampUTC > studentEndDateTimestampUTC;
};

export const isTaskNeededToFinish = ({ crossCheckState, crossCheckEndDate }: CourseTask) => {
  const currTimestampUTC = Date.now();
  const crossCheckEndDateTimestampUTC = Date.parse(crossCheckEndDate);
  return crossCheckState === 'distributed' && currTimestampUTC > crossCheckEndDateTimestampUTC;
};
