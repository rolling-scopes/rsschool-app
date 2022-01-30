import { CourseTaskDtoTypeEnum } from '../api';

export const TASK_TYPES = [
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
