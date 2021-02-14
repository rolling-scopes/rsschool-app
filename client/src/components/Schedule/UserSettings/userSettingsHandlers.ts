import { ColorState as IColorState } from 'react-color';
import { CSSProperties } from 'react';
import _ from 'lodash';
import { EVENT_TYPES, TASK_TYPES } from '../model';

export const pickerColors = [
  '#ff0000',
  '#03968d',
  '#fccb00',
  '#37d67a',
  '#308e00',
  '#2db7f5',
  '#004dcf',
  '#a326f4',
  '#fa28ff',
  '#959e3c',
];

// export const pickerColors = [
//   '#ff0000',
//   '#FF6900',
//   '#FCCB00',
//   '#37D67A',
//   '#308e00',
//   '#2db7f5',
//   '#004DCF',
//   '#a326f4',
//   '#FA28FF',
//   '#F78DA7',
// ];

export const DEFAULT_COLORS = {
  'CV HTML': '#004dcf',
  'CV Markdown': '#2db7f5',
  'Code Jam': '#fa28ff',
  'Code review': '#a326f4',
  Codewars: '#a326f4',
  'Cross-check': '#004dcf',
  'HTML task': '#308e00',
  Info: '#37d67a',
  Interview: '#37d67a',
  'JS task': '#03968d',
  'Kotlin task': '#fccb00',
  Meetup: '#2db7f5',
  'ObjC task': '#37d67a',
  'Offline Lecture': '#fa28ff',
  'Online Lecture': '#a326f4',
  'Online/Offline Lecture': '#959e3c',
  'Self Education': '#959e3c',
  'Self-studying': '#03968d',
  Special: '#308e00',
  Task: '#2db7f5',
  'Technical Screening': '#fccb00',
  Test: '#03968d',
  'Warm-up': '#fccb00',
  Webinar: '#004dcf',
  Workshop: '#308e00',
  deadline: '#ff0000',
  default: '#fccb00',
};

export const DEFAULT_COLOR = {
  default: '#308e00',
};

export const getDefaultColors = () => {
  const types = _.union(TASK_TYPES, EVENT_TYPES);
  const colorsWithoutDeadlineColor = pickerColors.filter(color => color !== '#ff0000');
  const diffColorCount = colorsWithoutDeadlineColor.length;

  const defColors = {};

  types.forEach((type, index) => {
    Object.defineProperty(defColors, type, { value: colorsWithoutDeadlineColor[index % diffColorCount] });
  });

  Object.defineProperty(defColors, 'default', { value: '#fccb00' });
  Object.defineProperty(defColors, 'deadline', { value: '#ff0000' });

  return defColors;
};

export function setTagColor(
  e: IColorState,
  tagName: string,
  localStorageHook: (value: object) => void,
  storedTagColors = {},
) {
  localStorageHook({ ...storedTagColors, [tagName]: e.hex });
}

export function getTagColor(tagName: string, storedTagColors: Record<string, string> = {}) {
  return storedTagColors[tagName] || DEFAULT_COLOR.default;
}

export function getTagStyle(tagName: string, storedTagColors = {}, styles?: CSSProperties) {
  const tagColor: string = getTagColor(tagName, storedTagColors);
  return {
    ...styles,
    borderColor: tagColor,
    color: tagColor,
    backgroundColor: `${tagColor}10`,
  };
}
