import { ColorState as IColorState } from 'react-color';
import { CSSProperties } from 'react';
import _ from 'lodash';
import { EVENT_TYPES, TASK_TYPES } from '../model';

export const DEADLINE_COLOR = '#ff0000';
export const DEFAULT_COLOR = '#308e00';

export const pickerColors = [
  '#4b5a59',
  '#ffa940',
  '#13c2c2',
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
  DEADLINE_COLOR,
  DEFAULT_COLOR,
];

export const DEFAULT_COLORS = {
  'CV HTML': '#004dcf',
  'CV Markdown': '#2db7f5',
  'Code Jam': '#fa28ff',
  'Code review': '#b04df0',
  Codewars: '#b04df0',
  'Cross-check': '#004dcf',
  'HTML task': DEFAULT_COLOR,
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
  Special: DEFAULT_COLOR,
  Task: '#2db7f5',
  'Technical Screening': '#ffa940',
  Test: '#4b5a59',
  'Warm-up': '#ffa940',
  Webinar: '#004dcf',
  Workshop: DEFAULT_COLOR,
  'Jupyter Notebook': '#fa28ff',
  deadline: DEADLINE_COLOR,
  default: DEFAULT_COLOR,
  'Cross-Check deadline': DEADLINE_COLOR,
};

export const getDefaultColors = () => {
  const types = _.union(TASK_TYPES, EVENT_TYPES);
  const colorsWithoutDeadlineColor = pickerColors.filter(color => color !== DEADLINE_COLOR);
  const diffColorCount = colorsWithoutDeadlineColor.length;

  const defColors = {};

  types.forEach((type, index) => {
    Object.defineProperty(defColors, type, { value: colorsWithoutDeadlineColor[index % diffColorCount] });
  });

  Object.defineProperty(defColors, 'default', { value: DEFAULT_COLOR });
  Object.defineProperty(defColors, 'deadline', { value: DEADLINE_COLOR });

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
  return storedTagColors[tagName] || DEFAULT_COLOR;
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
