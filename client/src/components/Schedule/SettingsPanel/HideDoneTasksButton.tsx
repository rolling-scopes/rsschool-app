import React from 'react';
import { Button, Tooltip } from 'antd';
import {
  BorderOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';

interface HidePassedEventsButtonProps {
  areDoneTasksHidden: boolean;
  setAreDoneTasksHidden: (value: boolean) => void;
}

const HideDoneTasksButton: React.FC<HidePassedEventsButtonProps> = ({
  areDoneTasksHidden,
  setAreDoneTasksHidden,
}) => {
  const toggleDoneTasksVisibility = () => setAreDoneTasksHidden(!areDoneTasksHidden);

  return (
    <Tooltip title="Hide done tasks" mouseEnterDelay={1}>
      <Button
        type="primary"
        onClick={toggleDoneTasksVisibility}
        icon={areDoneTasksHidden ? <BorderOutlined /> : <CheckSquareOutlined />}
      />
    </Tooltip>
  );
};

export default HideDoneTasksButton;
