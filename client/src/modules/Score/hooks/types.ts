export type ScoreTableFilters = {
  githubId?: string | string[];
  name?: string | string[];
  'mentor.githubId'?: string | string[];
  cityName?: string | string[];
  activeOnly: boolean;
};

export type ScoreOrderField =
  | 'rank'
  | 'totalScore'
  | 'crossCheckScore'
  | 'githubId'
  | 'name'
  | 'cityName'
  | 'mentor'
  | 'totalScoreChangeDate'
  | 'repositoryLastActivityDate';

export type ScoreOrder = {
  field: ScoreOrderField;
  order: 'ascend' | 'descend';
  column?: { sorter: ScoreOrderField };
};
