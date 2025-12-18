import { BgColorsOutlined } from '@ant-design/icons';
import { ColorPicker, Space, Tag } from 'antd';
import { CourseScheduleItemDtoTagEnum } from 'api';
import { TAG_NAME_MAP } from 'modules/Schedule/constants';
import { getTagStyle } from 'modules/Schedule/utils';
import React from 'react';
import type { Color } from 'antd/es/color-picker';
import SettingsItem from '@client/components/SettingsItem';

interface ChangeTagColorProps {
  tags: CourseScheduleItemDtoTagEnum[];
  tagColors: Record<string, string>;
  setTagColors: (value: Record<string, string>) => void;
}

const ChangeTagColors: React.FC<ChangeTagColorProps> = ({ tagColors, setTagColors, tags }) => {
  const changeColor = (colorState: Color, tag: CourseScheduleItemDtoTagEnum) =>
    setTagColors({ ...tagColors, [tag]: colorState.toHexString() });

  return (
    <SettingsItem header="Change Tag Colors" IconComponent={BgColorsOutlined}>
      <Space direction="vertical">
        {tags.map(tag => (
          <Space key={tag}>
            <ColorPicker defaultValue={tagColors[tag]} onChange={value => changeColor(value, tag)} />
            <Tag style={getTagStyle(tag, tagColors, { cursor: 'pointer' })}>{TAG_NAME_MAP[tag] ?? tag}</Tag>
          </Space>
        ))}
      </Space>
    </SettingsItem>
  );
};

export default ChangeTagColors;
