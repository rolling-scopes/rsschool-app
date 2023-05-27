import { CourseTaskDetailedDto } from 'api';
import dayjs from 'dayjs';
import { SelfEducationPublicAttributes, Verification } from 'services/course';
import { CourseTaskState, CourseTaskStatus, CourseTaskVerifications } from '../types';

function getState({ studentEndDate }: CourseTaskDetailedDto, verifications: Verification[]): CourseTaskState {
  const now = dayjs();
  const end = dayjs(studentEndDate);
  const attemptsCount = verifications?.length || 0;

  if (attemptsCount > 0) {
    return CourseTaskState.Completed;
  }

  if (now.isAfter(end) && !attemptsCount) {
    return CourseTaskState.Missed;
  }

  return CourseTaskState.Uncompleted;
}

function getStatus({ studentEndDate }: CourseTaskDetailedDto, verifications: Verification[]): CourseTaskStatus {
  const attemptsCount = verifications?.length || 0;
  const now = dayjs();
  const end = dayjs(studentEndDate);

  if (now.isAfter(end) && !attemptsCount) {
    return CourseTaskStatus.Missed;
  }

  if (now.isAfter(end) && attemptsCount) {
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
