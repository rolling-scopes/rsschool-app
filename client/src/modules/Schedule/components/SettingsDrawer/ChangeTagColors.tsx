import { BgColorsOutlined } from '@ant-design/icons';
import { Collapse, Tag } from 'antd';
import { CourseScheduleItemDtoTagEnum } from 'api';
import { PICKER_COLORS, TAG_NAME_MAP } from 'modules/Schedule/constants';
import { getTagStyle } from 'modules/Schedule/utils';
import React from 'react';
import { ColorState, GithubPicker } from 'react-color';
import SettingsItem from './SettingsItem';

const { Panel } = Collapse;

interface ChangeTagColorProps {
  tags: CourseScheduleItemDtoTagEnum[];
  tagColors: Record<string, string>;
  setTagColors: (value: Record<string, string>) => void;
}

const ChangeTagColors: React.FC<ChangeTagColorProps> = ({ tagColors, setTagColors, tags }) => {
  const changeColor = (colorState: ColorState, tag: CourseScheduleItemDtoTagEnum) =>
    setTagColors({ ...tagColors, [tag]: colorState.hex });

  return (
    <SettingsItem header="Change Tag Colors" IconComponent={BgColorsOutlined}>
      <Collapse accordion ghost>
        {tags.map(tag => (
          <Panel
            key={tag}
            header={<Tag style={getTagStyle(tag, tagColors, { cursor: 'pointer' })}>{TAG_NAME_MAP[tag] ?? tag}</Tag>}
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
