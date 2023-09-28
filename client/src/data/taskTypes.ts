import { TaskDtoTypeEnum } from '../api';

export const TASK_TYPES: { id: TaskDtoTypeEnum; name: string }[] = [
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

export const TASK_TYPES_MAP = TASK_TYPES.reduce(
  (acc, { id, name }) => ({ ...acc, [id]: name }),
  {} as Record<string, string>,
);
