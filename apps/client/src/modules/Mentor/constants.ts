export const INFO_MESSAGE =
  'Please be sure that your personal information is filled on profile, so that assigned students can contact you.';

export enum TaskSolutionsTableColumnKey {
  Number = 'number',
  Student = 'student',
  Task = 'task',
  DesiredDeadline = 'desiredDeadline',
  Score = 'score',
  SubmitScores = 'submitScores',
  SolutionUrl = 'solutionUrl',
}

export enum TaskSolutionsTableColumnName {
  Number = '#',
  Student = 'Student',
  Task = 'Task',
  DesiredDeadline = 'Desired deadline',
  Score = 'Score / Max',
  SubmitScores = 'Submit scores',
  SolutionUrl = 'Pull request',
}

export enum SolutionItemStatus {
  InReview = 'in-review',
  Done = 'done',
  RandomTask = 'random-task',
}

export const TASKS_STATUSES = Object.entries(SolutionItemStatus).map(([key, value]) => ({
  key: value,
  label: key,
}));
