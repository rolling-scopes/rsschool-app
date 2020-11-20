import React from 'react';
import { Collapse, Tag } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { GithubPicker } from 'react-color';
import { pickerColors, mockedTags as tags, setTagColor, getTagColor } from './userSettingsHandlers';

const SettingsTagColor: React.FC = () => {
  const { Panel } = Collapse;
  const [, setState] = React.useState();

  function handleUpdate() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setState({});
  }

  const collapseTags = (
    <Collapse accordion ghost>
      {tags.map((item) => {
        return (
          <Panel
            header={
              <Tag
                style={{
                  cursor: 'pointer',
                  borderColor: getTagColor(item.name),
                  color: getTagColor(item.name),
                  backgroundColor: `${getTagColor(item.name)}10`,
                }}
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
              onChange={(e) => {
                setTagColor(e, item.name);
                handleUpdate();
              }
              }
            />
          </Panel>
        );
      })}
    </Collapse>
  );

  return (
    <Collapse expandIcon={() => <BgColorsOutlined style={{ fontSize: '20px', color: '#08c' }} />}>
      <Panel header="Change Tag Color" key="tags">
        {collapseTags}
      </Panel>
    </Collapse>
  );
};

export default SettingsTagColor;
