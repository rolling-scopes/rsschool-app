import React, { useCallback } from 'react';
import TagColorIcon from './TagColorIcon';
import { Collapse, Tag } from 'antd';
import { GithubPicker } from 'react-color';
import { pickerColors, mockedTags as tags, setTagColor, getTagStyle, DEFAULT_COLOR } from './userSettingsHandlers';
import { useLocalStorage } from 'react-use';
import { ColorState as IColorState } from 'react-color';

const TagColor: React.FC = () => {
  const { Panel } = Collapse;
  const [storedTagColors, setStoredTagColors] = useLocalStorage<object>('tagColors', DEFAULT_COLOR);

  const memoizedSetTagColor = useCallback(
    (e: IColorState, itemName, storedTagColors) => {
      setTagColor(e, itemName, setStoredTagColors, storedTagColors);
    },
    [storedTagColors],
  );

  const collapseTags = (
    <Collapse accordion ghost>
      {tags.map((item) => {
        return (
          <Panel
            header={
              <Tag
                style={getTagStyle(item.name, storedTagColors, { cursor: 'pointer' })}
              >
                {item.name}
              </Tag>
            }
            key={item.name}
          >
            <GithubPicker
              colors={pickerColors}
              triangle="hide"
              width={'138px'}
              onChange={(e) => memoizedSetTagColor(e, item.name, storedTagColors)}
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
