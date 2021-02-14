import React, { useCallback } from 'react';
import TagColorIcon from './TagColorIcon';
import { Collapse, Tag } from 'antd';
import { GithubPicker } from 'react-color';
import { pickerColors, setTagColor, getTagStyle } from './userSettingsHandlers';
import { ColorState as IColorState } from 'react-color';

type Props = {
  tags: string[];
  storedTagColors?: object;
  setStoredTagColors: (value: object) => void;
};

const TagColor: React.FC<Props> = ({ storedTagColors, setStoredTagColors, tags }) => {
  const { Panel } = Collapse;

  const memoizedSetTagColor = useCallback(
    (e: IColorState, tagName, storedTagColors) => {
      setTagColor(e, tagName, setStoredTagColors, storedTagColors);
    },
    [storedTagColors],
  );

  const collapseTags = (
    <Collapse accordion ghost>
      {tags.map(tag => {
        return (
          <Panel header={<Tag style={getTagStyle(tag, storedTagColors, { cursor: 'pointer' })}>{tag}</Tag>} key={tag}>
            <GithubPicker
              colors={pickerColors}
              triangle="hide"
              width={'138px'}
              onChange={e => memoizedSetTagColor(e, tag, storedTagColors)}
            />
          </Panel>
        );
      })}
    </Collapse>
  );

  return (
    <Collapse expandIcon={() => <TagColorIcon />}>
      <Panel header="Change Tag Color" key="tags">
        {collapseTags}
      </Panel>
    </Collapse>
  );
};

export default TagColor;
