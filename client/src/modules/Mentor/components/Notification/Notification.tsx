import { Alert } from 'antd';
import React from 'react';
import { useLocalStorage } from 'react-use';
import { INFO_MESSAGE } from 'modules/Mentor/constants';

function Notification() {
  const [isShown, setIsShown] = useLocalStorage('isPersonalInformationNotificationShown', true);

  const handleClose = () => {
    setIsShown(false);
  };

  return isShown ? <Alert message={INFO_MESSAGE} type="info" showIcon closable onClose={handleClose} /> : null;
}

export default Notification;
