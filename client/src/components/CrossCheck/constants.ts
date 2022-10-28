import { TaskSolutionResultRole } from 'services/course';

export enum LocalStorageKey {
  AreContactsVisible = 'crossCheckAreContactsVisible',
}

export interface SolutionReviewSettings {
  areContactsVisible: boolean;
  setAreContactsVisible: (value: boolean) => void;
}

export const AVATAR_ICON_PATH = {
  expert: '/static/svg/crossCheck/Expert.svg',
  thanks: '/static/svg/crossCheck/Thanks.svg',
};

export const ROLE_TAG_COLOR = {
  [TaskSolutionResultRole.Checker]: 'processing',
  [TaskSolutionResultRole.Student]: 'success',
};
