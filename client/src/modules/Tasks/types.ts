import { TaskDto, TaskDtoTypeEnum } from 'api';

// discipline on form is the discipline id(number), on TaskDto it's an object(id, name);
type FormValues = Partial<Omit<TaskDto, 'discipline' | 'attributes'> & { discipline: number; attributes: string }>;

const enum ColumnName {
  Id = 'Id',
  Name = 'Name',
  Discipline = 'Discipline',
  Tags = 'Tags',
  Skills = 'Skills',
  Type = 'Type',
  UsedInCourses = 'Used in Courses',
  DescriptionURL = 'Description URL',
  PRRequired = 'PR Required',
  RepoName = 'Repo Name',
  Actions = 'Actions',
}

const enum Criteria {
  json = 'json',
  github = 'github',
  crossCheck = 'crossCheck',
}

type Settings = Record<Criteria, boolean>;

type SettingsSet = Record<Criteria, TaskDtoTypeEnum[]>;

export type { FormValues, Settings, SettingsSet };

export { ColumnName };
