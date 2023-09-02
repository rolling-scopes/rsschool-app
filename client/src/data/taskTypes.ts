import { CourseTaskDtoTypeEnum, TaskDtoTypeEnum } from '../api';

export const TASK_TYPES: { id: CourseTaskDtoTypeEnum; name: string }[] = [
  { id: CourseTaskDtoTypeEnum.Jstask, name: 'JS task' },
  { id: CourseTaskDtoTypeEnum.Kotlintask, name: 'Kotlin task' },
  { id: CourseTaskDtoTypeEnum.Objctask, name: 'Objective-C task' },
  { id: CourseTaskDtoTypeEnum.Htmltask, name: 'HTML task' },
  { id: CourseTaskDtoTypeEnum.Ipynb, name: 'Jupyter Notebook' },
  { id: CourseTaskDtoTypeEnum.Cvmarkdown, name: 'CV (Markdown)' },
  { id: CourseTaskDtoTypeEnum.Cvhtml, name: 'CV (HTML)' },
  { id: CourseTaskDtoTypeEnum.Selfeducation, name: 'RS School App Test' },
  { id: CourseTaskDtoTypeEnum.Codewars, name: 'Codewars' },
  { id: CourseTaskDtoTypeEnum.Test, name: 'Google Form Test' },
  { id: CourseTaskDtoTypeEnum.Codejam, name: 'Codejam' },
  { id: CourseTaskDtoTypeEnum.Interview, name: 'Interview' },
  { id: CourseTaskDtoTypeEnum.StageInterview, name: 'Technical Screening' },
];

export const TASK_TYPES_MAP = TASK_TYPES.reduce(
  (acc, { id, name }) => ({ ...acc, [id]: name }),
  {} as Record<string, string>,
);

// TODO: resolve double source data issue(TaskDtoTypeEnum, CourseTaskDtoTypeEnum)
export const NEW_API_TASK_TYPES: { id: TaskDtoTypeEnum; name: string }[] = [
  { id: TaskDtoTypeEnum.Jstask, name: 'JS task' },
  { id: TaskDtoTypeEnum.Kotlintask, name: 'Kotlin task' },
  { id: TaskDtoTypeEnum.Objctask, name: 'Objective-C task' },
  { id: TaskDtoTypeEnum.Htmltask, name: 'HTML task' },
  { id: TaskDtoTypeEnum.Ipynb, name: 'Jupyter Notebook' },
  { id: TaskDtoTypeEnum.Cvmarkdown, name: 'CV (Markdown)' },
  { id: TaskDtoTypeEnum.Cvhtml, name: 'CV (HTML)' },
  { id: TaskDtoTypeEnum.Selfeducation, name: 'RS School App Test' },
  { id: TaskDtoTypeEnum.Codewars, name: 'Codewars' },
  { id: TaskDtoTypeEnum.Test, name: 'Google Form Test' },
  { id: TaskDtoTypeEnum.Codejam, name: 'Codejam' },
  { id: TaskDtoTypeEnum.Interview, name: 'Interview' },
  { id: TaskDtoTypeEnum.StageInterview, name: 'Technical Screening' },
];
