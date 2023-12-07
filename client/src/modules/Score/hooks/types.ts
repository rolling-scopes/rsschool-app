export type ScoreTableFilters = {
  githubId?: string[];
  name?: string[];
  'mentor.githubId'?: string[];
  cityName?: string[];
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
