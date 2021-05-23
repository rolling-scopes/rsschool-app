import React, { useState } from 'react';
import { Button, Drawer, Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import TagColor from './TagColor';

type Props = {
  typesFromBase: string[];
  storedTagColors?: object;
  setStoredTagColors: (value: object) => void;
};

const UserSettings: React.FC<Props> = ({ storedTagColors, setStoredTagColors, typesFromBase }) => {
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
        <TagColor tags={typesFromBase} setStoredTagColors={setStoredTagColors} storedTagColors={storedTagColors} />
      </Drawer>
    </Tooltip>
  );
};

export default UserSettings;
