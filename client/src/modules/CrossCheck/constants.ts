import { CrossCheckMessageDtoRoleEnum } from 'api';

export enum LocalStorageKey {
  AreContactsVisible = 'crossCheckAreContactsVisible',
}

export interface SolutionReviewSettings {
  areContactsVisible: boolean;
  setAreContactsVisible?: (value: boolean) => void;
}

export const AVATAR_ICON_PATH = {
  expert: '/static/svg/sloths/Expert.svg',
  thanks: '/static/svg/sloths/Thanks.svg',
};

export const ROLE_TAG_COLOR = {
  [CrossCheckMessageDtoRoleEnum.Reviewer]: 'processing',
  [CrossCheckMessageDtoRoleEnum.Student]: 'success',
};

export enum EditableTableColumnsDataIndex {
  Sort = 'sort',
  Type = 'type',
  Max = 'max',
  Text = 'text',
  Actions = 'actions',
}

export enum TaskType {
  Title = 'title',
  Subtask = 'subtask',
  Penalty = 'penalty',
}
