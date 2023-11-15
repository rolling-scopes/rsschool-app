import { TaskDto } from 'api';

type ModalData = (Partial<Omit<TaskDto, 'attributes'>> & { attributes?: string }) | null;

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

export type { ModalData };

export { ColumnName };
