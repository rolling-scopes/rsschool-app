import React, { useCallback } from 'react';
import TagColorIcon from './TagColorIcon';
import { Collapse, Tag } from 'antd';
import { GithubPicker } from 'react-color';
import { pickerColors, setTagColor, getTagStyle, DEFAULT_COLOR } from './userSettingsHandlers';
import { useLocalStorage } from 'react-use';
import { ColorState as IColorState } from 'react-color';

type Props = {
  tags: string[];
};

const TagColor = ({ tags }: Props) => {
  const { Panel } = Collapse;
  const [storedTagColors, setStoredTagColors] = useLocalStorage<object>('tagColors', DEFAULT_COLOR);

  const memoizedSetTagColor = useCallback(
    (e: IColorState, tagName, storedTagColors) => {
      setTagColor(e, tagName, setStoredTagColors, storedTagColors);
    },
    [storedTagColors],
  );

  const collapseTags = (
    <Collapse accordion ghost>
      {tags.map((tag) => {
        return (
          <Panel
            header={
              <Tag
                style={getTagStyle(tag, storedTagColors, { cursor: 'pointer' })}
              >
                {tag}
              </Tag>
            }
            key={tag}
          >
            <GithubPicker
              colors={pickerColors}
              triangle="hide"
              width={'138px'}
              onChange={(e) => memoizedSetTagColor(e, tag, storedTagColors)}
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
