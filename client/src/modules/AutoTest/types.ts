import { CourseTaskDetailedDto } from '@client/api';
import { SelfEducationPublicAttributes, Verification } from '@client/services/course';

export enum CourseTaskStatus {
  Available = 'Available',
  Missed = 'Missed',
  Done = 'Done',
}

export const COURSE_TASK_STATUSES = Object.entries(CourseTaskStatus).map(([key, value]) => ({ key, value }));

export enum CourseTaskState {
  Uncompleted = 'Uncompleted',
  Missed = 'Missed',
  Completed = 'Completed',
}

export interface CourseTaskVerifications extends CourseTaskDetailedDto {
  publicAttributes: SelfEducationPublicAttributes;
  status: CourseTaskStatus;
  state: CourseTaskState;
  verifications: Verification[];
}
