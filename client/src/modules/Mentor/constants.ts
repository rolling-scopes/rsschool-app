export const INFO_MESSAGE =
  'Please be sure that your personal information is filled on profile, so that assigned students can contact you.';

export enum TaskSolutionsTableColumnKey {
  Number = 'number',
  Name = 'name',
  Task = 'task',
  DesiredDeadline = 'desiredDeadline',
  Score = 'score',
  SubmitScores = 'submitScores',
  SolutionUrl = 'solutionUrl',
}

export enum TaskSolutionsTableColumnName {
  Number = '#',
  Name = 'Name',
  Task = 'Task',
  DesiredDeadline = 'Desired deadline',
  Score = 'Score / Max',
  SubmitScores = 'Submit scores',
  SolutionUrl = 'Pull request',
}

export enum StudentTaskSolutionItemStatus {
  InReview = 'in-review',
  Done = 'done',
}

export const TASKS_STATUSES = Object.entries(StudentTaskSolutionItemStatus).map(([key, value]) => ({
  value,
  text: key,
}));
