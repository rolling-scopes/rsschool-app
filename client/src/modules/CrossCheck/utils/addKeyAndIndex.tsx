import { CriteriaData } from 'services/course';

export const addKeyAndIndex = (array: CriteriaData[]): CriteriaData[] => {
  return array.map((item, index) => {
    item.key = index.toString();
    item.index = index;
    return item;
  });
};
