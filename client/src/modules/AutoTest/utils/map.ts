import { CourseTaskDetailedDto } from '@client/api';
import dayjs from 'dayjs';
import { SelfEducationPublicAttributes, Verification } from 'services/course';
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
  { studentEndDate, maxScore, publicAttributes }: CourseTaskDetailedDto,
  verifications: Verification[],
): CourseTaskStatus {
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

// TODO: refactor nestjs models to return CourseTaskVerifications from server
export function mapTo(courseTask: CourseTaskDetailedDto, verifications: Verification[]): CourseTaskVerifications {
  const taskVerifications = verifications.filter(v => v.courseTaskId === courseTask.id);

  return {
    ...courseTask,
    state: getState(courseTask, taskVerifications),
    status: getStatus(courseTask, taskVerifications),
    publicAttributes: courseTask.publicAttributes as SelfEducationPublicAttributes,
    verifications: taskVerifications,
  };
}
