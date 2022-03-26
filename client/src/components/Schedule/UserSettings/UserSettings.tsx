import React, { useState } from 'react';
import { Button, Drawer, Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
// import TagColor from './TagColor';

type Props = {
  typesFromBase: string[];
  storedTagColors?: object;
  onSaveTagColors: (value: object) => void;
  limitForDoneTask?: number;
  onSaveLimitForDoneTask: (value: number) => void;
};

const UserSettings: React.FC<Props> = (_: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const showDrawer = () => {
    setIsOpen(true);
  };
  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Tooltip title="User settings" mouseEnterDelay={1}>
      <Button icon={<SettingOutlined />} title="User settings" size="middle" type="primary" onClick={showDrawer} />
      <Drawer title="User Settings" placement="right" closable={false} onClose={onClose} visible={isOpen}>
        {/* <TagColor
          tags={typesFromBase}
          onSaveTagColors={onSaveTagColors}
          storedTagColors={storedTagColors}
          limitForDoneTask={limitForDoneTask}
          onSaveLimitForDoneTask={onSaveLimitForDoneTask}
        /> */}
      </Drawer>
    </Tooltip>
  );
};

export default UserSettings;
