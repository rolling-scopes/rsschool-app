import { CheckCircleOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import { formatShortDate } from 'services/formatter';
import { isRegistrationNotStarted } from 'domain/interview';

export const ExtraInfo = ({
  id,
  registrationStart,
  isRegistered,
  onRegister,
}: {
  id: number;
  registrationStart: string;
  isRegistered: boolean;
  onRegister: (id: string) => void;
}) => {
  const registrationNotStarted = isRegistrationNotStarted(registrationStart);

  return registrationNotStarted ? (
    <Tag color="orange">Registration starts on {formatShortDate(registrationStart)}</Tag>
  ) : (
    <Button
      onClick={() => onRegister(id.toString())}
      icon={isRegistered ? <CheckCircleOutlined /> : null}
      disabled={isRegistered}
      type={isRegistered ? 'default' : 'primary'}
    >
      {isRegistered ? 'Registered' : 'Register'}
    </Button>
  );
};
