import { CourseTaskDto } from 'api';

export function getTasksTotalScore(courseTasks: CourseTaskDto[]) {
  return courseTasks.reduce((score, task) => score + (task.maxScore ?? 0) * task.scoreWeight, 0);
}
