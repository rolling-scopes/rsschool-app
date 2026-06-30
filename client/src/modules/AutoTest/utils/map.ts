import { CourseTaskDetailedDto } from '@client/api';
import dayjs from 'dayjs';
import { SelfEducationPublicAttributes, Verification } from '@client/services/course';
import { CourseTaskState, CourseTaskStatus, CourseTaskVerifications } from '../types';

function getState(courseTask: CourseTaskDetailedDto, verifications: Verification[]): CourseTaskState {
  const now = dayjs();
  const end = dayjs(courseTask.studentEndDate);
  const attemptsCount = verifications?.length || 0;

  const publicAttributes = courseTask.publicAttributes as SelfEducationPublicAttributes;
  const isScorePassed = verifications?.some(v => v.score >= publicAttributes.tresholdPercentage) ?? false;

  if (isScorePassed) {
    return CourseTaskState.Completed;
  }

  if (now.isAfter(end) && !attemptsCount) {
    return CourseTaskState.Missed;
  }

  return CourseTaskState.Uncompleted;
}

function getStatus(
  { id, studentEndDate, maxScore, publicAttributes }: CourseTaskDetailedDto,
  verifications: Verification[],
  manuallyDoneIds: number[],
): CourseTaskStatus {
  if (manuallyDoneIds.includes(id)) {
    return CourseTaskStatus.Done;
  }

  const attemptsCount = verifications?.length || 0;
  const now = dayjs();
  const end = dayjs(studentEndDate);

  const publicAttr = publicAttributes as SelfEducationPublicAttributes;
  const isMaxAttemptsCount = attemptsCount >= publicAttr.maxAttemptsNumber;

  if (now.isAfter(end) && !attemptsCount) {
    return CourseTaskStatus.Missed;
  }

  if (publicAttr.strictAttemptsMode && isMaxAttemptsCount) {
    return CourseTaskStatus.Done;
  }

  if (maxScore === verifications[0]?.score || (now.isAfter(end) && attemptsCount)) {
    return CourseTaskStatus.Done;
  }

  if (isMaxAttemptsCount && maxScore / 2 === verifications[0]?.score) {
    return CourseTaskStatus.Done;
  }

  return CourseTaskStatus.Available;
}

// `verifications` are already scoped to this course task — the server returns them grouped by
// courseTaskId (see CourseTaskVerificationsDto), so no client-side filtering is needed here.
export function mapTo(
  courseTask: CourseTaskDetailedDto,
  verifications: Verification[],
  manuallyDoneIds: number[] = [],
): CourseTaskVerifications {
  return {
    ...courseTask,
    state: getState(courseTask, verifications),
    status: getStatus(courseTask, verifications, manuallyDoneIds),
    publicAttributes: courseTask.publicAttributes as SelfEducationPublicAttributes,
    verifications,
  };
}
