import { BgColorsOutlined } from '@ant-design/icons';
import { Collapse, Tag } from 'antd';
import { TASK_EVENT_TYPES_MAP } from 'data';
import { PICKER_COLORS } from 'modules/Schedule/constants';
import { getTagStyle } from 'modules/Schedule/utils';
import React from 'react';
import { ColorState, GithubPicker } from 'react-color';
import SettingsItem from './SettingsItem';

const { Panel } = Collapse;

interface ChangeTagColorProps {
  tags: string[];
  tagColors: Record<string, string>;
  setTagColors: (value: Record<string, string>) => void;
}

const ChangeTagColors: React.FC<ChangeTagColorProps> = ({ tagColors, setTagColors, tags }) => {
  const changeColor = (colorState: ColorState, tag: string) => setTagColors({ ...tagColors, [tag]: colorState.hex });

  return (
    <SettingsItem header="Change Tag Colors" IconComponent={BgColorsOutlined}>
      <Collapse accordion ghost>
        {tags.map(tag => (
          <Panel
            key={tag}
            header={
              <Tag style={getTagStyle(tag, tagColors, { cursor: 'pointer' })}>{TASK_EVENT_TYPES_MAP[tag] ?? tag}</Tag>
            }
            style={{ backgroundColor: '#fafafa' }}
          >
            <GithubPicker
              colors={PICKER_COLORS}
              triangle="hide"
              width="138px"
              onChange={colorState => changeColor(colorState, tag)}
            />
          </Panel>
        ))}
      </Collapse>
    </SettingsItem>
  );
};

export default ChangeTagColors;
