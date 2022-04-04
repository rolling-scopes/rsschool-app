import React from 'react';
import { Collapse, Tag } from 'antd';
import { GithubPicker } from 'react-color';
import { BgColorsOutlined } from '@ant-design/icons';
import SettingsItem from './SettingsItem';
import { pickerColors, setTagColor, getTagStyle } from './scheduleSettingsHandlers';

const { Panel } = Collapse;

type ChangeTagColorProps = {
  tags: string[];
  tagColors?: object;
  onSaveTagColors: (value: object) => void;
};

const ChangeTagColor: React.FC<ChangeTagColorProps> = ({ tagColors, onSaveTagColors, tags }) => (
  <SettingsItem header="Change tag color" IconComponent={BgColorsOutlined}>
    <Collapse accordion ghost>
      {tags.map(tag => {
        return (
          <Panel
            key={tag}
            header={<Tag style={getTagStyle(tag, tagColors, { cursor: 'pointer' })}>{tag}</Tag>}
            style={{ backgroundColor: '#fafafa' }}
          >
            <GithubPicker
              colors={pickerColors}
              triangle="hide"
              width="138px"
              onChange={event => setTagColor(event, tag, onSaveTagColors, tagColors)}
            />
          </Panel>
        );
      })}
    </Collapse>
  </SettingsItem>
);

export default ChangeTagColor;
