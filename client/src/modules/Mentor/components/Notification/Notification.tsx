import { Alert } from 'antd';
import { useLocalStorage } from 'react-use';
import { INFO_MESSAGE } from '@client/modules/Mentor/constants';

function Notification() {
  const [isShown, setIsShown] = useLocalStorage('isPersonalInformationNotificationShown', true);

  const handleClose = () => {
    setIsShown(false);
  };

  return isShown ? (
    <Alert message={INFO_MESSAGE} type="info" showIcon closable onClose={handleClose} style={{ marginBottom: 24 }} />
  ) : null;
}

export default Notification;
