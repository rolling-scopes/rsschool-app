import React from 'react';
import { Collapse, Tag } from 'antd';
import { GithubPicker, ColorState } from 'react-color';
import { BgColorsOutlined } from '@ant-design/icons';
import SettingsItem from './SettingsItem';
import { PICKER_COLORS } from 'components/Schedule/constants';
import { setTagColor, getTagStyle } from 'components/Schedule/utils';

const { Panel } = Collapse;

interface ChangeTagColorProps {
  tags: string[];
  tagColors: Record<string, string>;
  setTagColors: (value: Record<string, string>) => void;
}

const ChangeTagColors: React.FC<ChangeTagColorProps> = ({ tagColors, setTagColors, tags }) => {
  const changeColor = (colorState: ColorState, tag: string) => setTagColor(colorState, tag, setTagColors, tagColors);

  return (
    <SettingsItem header="Change tag colors" IconComponent={BgColorsOutlined}>
      <Collapse accordion ghost>
        {tags.map(tag => (
          <Panel
            key={tag}
            header={<Tag style={getTagStyle(tag, tagColors, { cursor: 'pointer' })}>{tag}</Tag>}
            style={{ backgroundColor: '#fafafa' }}
          >
            <GithubPicker
              colors={PICKER_COLORS}
              triangle="hide"
              width="138px"
              onChange={(colorState) => changeColor(colorState, tag)}
            />
          </Panel>
        ))}
      </Collapse>
    </SettingsItem>
  );
};

export default ChangeTagColors;
