import { CourseTaskDtoTypeEnum, DisciplineDto } from 'api';

export type TaskType = CourseTaskDtoTypeEnum;

interface IIdentifiers {
  id: number;
}

export interface Task {
  id: number;
  createdDate: string;
  updatedDate: string;
  name: string;
  descriptionUrl: string | null;
  description: string | null;
  identifiers: IIdentifiers[];
  githubPrRequired: boolean | null;
  type: TaskType;
  githubRepoName: string;
  sourceGithubRepoUrl: string;
  tags: string[];
  skills: string[];
  discipline: DisciplineDto;
  disciplineId: number;
  attributes: Record<string, any>;
}
