import { DEFAULT_COLOR } from 'modules/Schedule/constants';
import { CSSProperties } from 'react';

export const getTagStyle = (tagName: string, tagColors: Record<string, string> = {}, styles?: CSSProperties) => {
  const tagColor = tagColors[tagName] || DEFAULT_COLOR;
  return {
    ...styles,
    borderColor: tagColor,
    color: tagColor,
    backgroundColor: `${tagColor}10`,
  };
};
