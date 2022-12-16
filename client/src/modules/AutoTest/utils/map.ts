import { CourseTaskDetailedDto } from 'api';
import moment from 'moment';
import { SelfEducationPublicAttributes, Verification } from 'services/course';
import { CourseTaskState, CourseTaskStatus, CourseTaskVerifications } from '../types';

function getState({ studentEndDate, resultsCount }: CourseTaskDetailedDto): CourseTaskState {
  const now = moment();
  const end = moment(studentEndDate);

  if (resultsCount > 0) {
    return CourseTaskState.Completed;
  }

  if (now.isAfter(end) && !resultsCount) {
    return CourseTaskState.Missed;
  }

  return CourseTaskState.Uncompleted;
}

function getStatus(courseTask: CourseTaskDetailedDto, verifications: Verification[]): CourseTaskStatus {
  const { studentEndDate, resultsCount, publicAttributes } = courseTask;
  const { maxAttemptsNumber } = (publicAttributes as SelfEducationPublicAttributes) || {};
  const leftCount = maxAttemptsNumber - (verifications?.length || 0);
  const attemptsLeft = leftCount > 0 ? leftCount : 0;
  const now = moment();
  const end = moment(studentEndDate);

  if (now.isAfter(end) && !resultsCount) {
    return CourseTaskStatus.Missed;
  }

  if (now.isAfter(end) && (resultsCount || !attemptsLeft)) {
    return CourseTaskStatus.Done;
  }

  return CourseTaskStatus.Available;
}

// TODO: refactor nestjs models to return CourseTaskVerifications from server
export function mapTo(courseTask: CourseTaskDetailedDto, verifications: Verification[]): CourseTaskVerifications {
  const taskVerifications = verifications.filter(v => v.courseTaskId === courseTask.id);

  return {
    ...courseTask,
    state: getState(courseTask),
    status: getStatus(courseTask, taskVerifications),
    publicAttributes: courseTask.publicAttributes as SelfEducationPublicAttributes,
    verifications: taskVerifications,
  };
}
