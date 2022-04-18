import React from 'react';
import { Collapse, Tag } from 'antd';
import { GithubPicker, ColorState } from 'react-color';
import { BgColorsOutlined } from '@ant-design/icons';
import { PICKER_COLORS } from '../constants';
import { getTagStyle } from '../utils';
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
              onChange={colorState => changeColor(colorState, tag)}
            />
          </Panel>
        ))}
      </Collapse>
    </SettingsItem>
  );
};

export default ChangeTagColors;
