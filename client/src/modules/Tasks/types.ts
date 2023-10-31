import { TaskDto, TaskDtoTypeEnum } from 'api';

// discipline on form is the discipline id(number), on TaskDto it's an object(id, name);
type FormValues = Partial<Omit<TaskDto, 'discipline' | 'attributes'> & { discipline: number; attributes: string }>;

type ModalData = Partial<Omit<TaskDto, 'attributes'> & { attributes: string }> | null;

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

type Settings = {
  isJsonRequired: boolean;
  isGithubRequired: boolean;
  isCrossCheckRequired: boolean;
};

type SettingsSet = Record<'json' | 'github' | 'crossCheck', TaskDtoTypeEnum[]>;

export type { FormValues, ModalData, Settings, SettingsSet };

export { ColumnName };
