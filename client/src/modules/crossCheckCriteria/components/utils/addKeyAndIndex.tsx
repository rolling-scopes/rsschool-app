import { CriteriaData } from 'services/course';

export const addKeyAndIndex = (array: CriteriaData[]) => {
  array.map((item, index) => (item.key = index.toString()));
  array.map((item, index) => (item.index = index));
  return array;
};
