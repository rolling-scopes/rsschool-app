export type ScoreTableFilters = {
  githubId?: string;
  name?: string;
  'mentor.githubId'?: string;
  cityName?: string;
  activeOnly: boolean;
};

export type ScoreOrder = {
  field: string;
  order: 'ascend' | 'descend';
  column?: { sorter: string };
};
