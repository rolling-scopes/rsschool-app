import React from 'react';
import { Button, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface AddEventButtonProps {
  openManageEventModal: () => void;
}

const AddEventButton: React.FC<AddEventButtonProps> = ({
  openManageEventModal
}) => (
  <Tooltip title="Add new" mouseEnterDelay={1}>
    <Button type="primary" icon={<PlusOutlined />} onClick={openManageEventModal} />
  </Tooltip>
);

export default AddEventButton;
