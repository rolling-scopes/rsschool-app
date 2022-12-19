import { CriteriaDto } from 'api';

export const addKeyAndIndex = (array: CriteriaDto[]): CriteriaDto[] => {
  return array.map((item, index) => ({
    ...item,
    key: index.toString(),
    index,
  }));
};
