import { CourseTask } from 'services/course';

export const requiredValidator = (value: any) => (value != null ? undefined : 'Required');

const githubPrRegExp = /https:\/\/github.com\/(\w|\d|\-)+\/(\w|\d|\-)+\/pull\/(\d)+/gi;
export const taskGithubPrValidator = (courseTasks: CourseTask[]) => (value: string, allValues: any) => {
  if (!allValues.courseTaskId) {
    return;
  }
  const courseTaskId = Number(allValues.courseTaskId);
  const task = courseTasks.find(courseTask => courseTask.courseTaskId === courseTaskId);
  if (task == null || !task.githubPrRequired) {
    return;
  }
  if (!value) {
    return 'Required';
  }
  if (!value.match(githubPrRegExp)) {
    return 'URL is not Github Pull Request';
  }
  return;
};

export const commentValidator = (minLength: number) => (value: any) => {
  if (!value || value.length < minLength) {
    return `Comment should be at least ${minLength} characters`;
  }
  return undefined;
};
