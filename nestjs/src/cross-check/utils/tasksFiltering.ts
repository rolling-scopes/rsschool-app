import { CourseTask } from '@entities/courseTask';

export const getTaskFilters = () => {
  const currTimestampUTC = Date.now();

  const isTaskNeededToStart = ({ crossCheckState, studentEndDate }: CourseTask) => {
    const studentEndDateTimestampUTC = Date.parse(studentEndDate as string);
    return crossCheckState === 'initial' && currTimestampUTC > studentEndDateTimestampUTC;
  };

  const isTaskNeededToFinish = ({ crossCheckState, crossCheckEndDate }: CourseTask) => {
    const crossCheckEndDateTimestampUTC = Date.parse(crossCheckEndDate);
    return crossCheckState === 'distributed' && currTimestampUTC > crossCheckEndDateTimestampUTC;
  };

  return {
    isTaskNeededToStart,
    isTaskNeededToFinish,
  };
};
