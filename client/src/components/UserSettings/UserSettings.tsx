import React, { useState } from 'react';
import { Button, Drawer } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import TagColor from './TagColor';


const UserSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const showDrawer = () => {
    setIsOpen(true);
  };
  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button icon={<SettingOutlined />} title='User settings' size='middle' type="primary" onClick={showDrawer} />

      <Drawer title="User Settings" placement="right" closable={false} onClose={onClose} visible={isOpen}>
        <TagColor />
      </Drawer>
    </>
  );
};

export default UserSettings;
