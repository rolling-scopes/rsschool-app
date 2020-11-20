import { ColorState as IColorState } from 'react-color';

export const pickerColors = [
  '#ff0000',
  '#FF6900',
  '#FCCB00',
  '#37D67A',
  '#308e00',
  '#2db7f5',
  '#004DCF',
  '#a326f4',
  '#FA28FF',
  '#F78DA7',
];

const defaultColor = '#308e00';

export function setTagColor(e: IColorState, tagName: string) {
  localStorage.setItem(tagName.toLowerCase(), e.hex);
}

export function getTagColor(tagName: string) {
  return localStorage.getItem(tagName.toLowerCase()) || defaultColor;
}

export const mockedTags = [
  { name: 'deadline' },
  { name: 'test' },
  { name: 'jstask' },
  { name: 'htmltask' },
  { name: 'externaltask' },
  { name: 'selfeducation' },
  { name: 'codewars' },
  { name: 'codejam' },
  { name: 'newtask' },
  { name: 'lecture' },
  { name: 'lecture_online' },
  { name: 'lecture_offline' },
  { name: 'lecture_mixed' },
  { name: 'lecture_self_study' },
  { name: 'info' },
  { name: 'warmup' },
  { name: 'meetup' },
  { name: 'workshop' },
  { name: 'interview' },
];
