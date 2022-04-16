import React from 'react';
import { Button, Tooltip } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

interface HidePassedEventsButtonProps {
  arePassedEventsHidden: boolean;
  setArePassedEventsHidden: (value: boolean) => void;
}

const HidePassedEventsButton: React.FC<HidePassedEventsButtonProps> = ({
  arePassedEventsHidden,
  setArePassedEventsHidden,
}) => {
  const togglePassedEventsVisibility = () => setArePassedEventsHidden(!arePassedEventsHidden);

  return (
    <Tooltip title="Hide old events" mouseEnterDelay={1}>
      <Button
        type="primary"
        onClick={togglePassedEventsVisibility}
        icon={arePassedEventsHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      />
    </Tooltip>
  );
};

export default HidePassedEventsButton;
