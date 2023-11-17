import { ModalFormMode } from 'hooks';

const LABELS = {
  name: 'Task name',
  taskType: 'Task type',
  discipline: 'Discipline',
  tags: 'Tags',
  descriptionUrl: 'Description URL',
  summary: 'Summary',
  skills: 'Skills',
  usedInCourses: 'Used in Courses',
  crossCheckCriteria: 'Criteria For Cross-Check',
  repoUrl: 'Source Repo Url',
  expectedRepoName: 'Expected Repo Name',
};

const TASK_SETTINGS_HEADERS = {
  crossCheckCriteria: 'Criteria For Cross-Check Task',
  github: 'Github',
  jsonAttributes: 'JSON Attributes',
};

const PLACEHOLDERS = {
  name: 'Short descriptive title',
  taskType: 'Choose task type',
  discipline: 'Choose the right one',
  tags: 'Choose tags to define task options',
  descriptionUrl: 'Input the task link',
  summary: 'Purpose and objectives, student value, etc.',
  skills: 'Choose skills to define task options',
  jsonAttributes: 'Input JSON attributes',
  sourceGithubRepoUrl: 'https://github.com/rolling-scopes-school/task1',
  githubRepoName: 'task1',
};

const ERROR_MESSAGES = {
  name: 'Please enter task name',
  taskType: 'Please select a type',
  discipline: 'Please select a discipline',
  descriptionUrl: 'Please enter description URL',
  validUrl: 'Please enter valid URL',
  sourceGithubRepoUrl: 'Please enter valid source github repo URL',
  invalidJson: 'Invalid JSON',
};

const MODAL_TITLES: Record<ModalFormMode, string> = {
  create: 'Add Task',
  edit: 'Edit Task',
};

export { LABELS, TASK_SETTINGS_HEADERS, PLACEHOLDERS, ERROR_MESSAGES, MODAL_TITLES };
