import { CriteriaDto } from '@client/api';

export const addKeyAndIndex = (array: CriteriaDto[]): CriteriaDto[] => {
  return array.map((item, index) => ({
    ...item,
    key: index.toString(),
    index,
  }));
};
