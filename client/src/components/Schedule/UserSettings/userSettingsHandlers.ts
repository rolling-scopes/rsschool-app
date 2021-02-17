import { ColorState as IColorState } from 'react-color';
import { CSSProperties } from 'react';
import _ from 'lodash';
import { EVENT_TYPES, TASK_TYPES } from '../model';

export const pickerColors = [
  '#ff0000',
  '#4b5a59',
  '#ffa940',
  '#13c2c2',
  '#308e00',
  '#2db7f5',
  '#004dcf',
  '#b04df0',
  '#fa28ff',
  '#959e3c',
  '#9ce20d',
  '#24db00',
  '#ff7a45',
  '#ae8989',
  '#9321a2',
];

export const DEFAULT_COLORS = {
  'CV HTML': '#004dcf',
  'CV Markdown': '#2db7f5',
  'Code Jam': '#fa28ff',
  'Code review': '#b04df0',
  Codewars: '#b04df0',
  'Cross-check': '#004dcf',
  'HTML task': '#308e00',
  Info: '#13c2c2',
  Interview: '#13c2c2',
  'JS task': '#4b5a59',
  'Kotlin task': '#ffa940',
  Meetup: '#2db7f5',
  'ObjC task': '#13c2c2',
  'Offline Lecture': '#fa28ff',
  'Online Lecture': '#b04df0',
  'Online/Offline Lecture': '#959e3c',
  'Self Education': '#959e3c',
  'Self-studying': '#4b5a59',
  Special: '#308e00',
  Task: '#2db7f5',
  'Technical Screening': '#ffa940',
  Test: '#4b5a59',
  'Warm-up': '#ffa940',
  Webinar: '#004dcf',
  Workshop: '#308e00',
  deadline: '#ff0000',
  default: '#ffa940',
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

export const setTagColor = (
  e: IColorState,
  tagName: string,
  localStorageHook: (value: object) => void,
  storedTagColors = {},
) => {
  localStorageHook({ ...storedTagColors, [tagName]: e.hex });
};

export const getTagColor = (tagName: string, storedTagColors: Record<string, string> = {}) => {
  return storedTagColors[tagName] || DEFAULT_COLOR.default;
};

export const getTagStyle = (tagName: string, storedTagColors = {}, styles?: CSSProperties) => {
  const tagColor: string = getTagColor(tagName, storedTagColors);
  return {
    ...styles,
    borderColor: tagColor,
    color: tagColor,
    backgroundColor: `${tagColor}10`,
  };
};
