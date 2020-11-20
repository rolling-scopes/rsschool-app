import React, { useState } from 'react';
import { Button, Drawer } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import SettingsTagColor from './SettingsTagColor';


const UserSettings: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const showDrawer = () => {
    setIsVisible(true);
  };
  const onClose = () => {
    setIsVisible(false);
  };

  return (
    <>
      <Button icon={<SettingOutlined />} title='User settings' size='large' type="primary" onClick={showDrawer}/>

      <Drawer title="User Settings" placement="right" closable={false} onClose={onClose} visible={isVisible}>
        <SettingsTagColor />
      </Drawer>
    </>
  );
};

export default UserSettings;
