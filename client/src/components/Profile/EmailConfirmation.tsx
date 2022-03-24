import { Alert } from 'antd';
import { Timer } from 'components/Timer';
import moment from 'moment';
import { useCallback, useState } from 'react';

export type Connection = {
  value: string;
  enabled: boolean;
  lastLinkSentAt?: number;
};

type Props = {
  connection?: Connection;
  sendConfirmationEmail: () => void;
};

export function EmailConfirmation({ connection, sendConfirmationEmail }: Props) {
  const [lastSent, setLastSent] = useState(connection?.lastLinkSentAt);
  const allowedToResend = !lastSent ? true : moment().diff(moment(lastSent), 'seconds') > 60;

  const sendEmailConfirmationLink = useCallback(() => {
    sendConfirmationEmail();
    setLastSent(Date.now());
  }, []);

  return (
    <Alert
      type="error"
      message={
        <div>
          Email is not verified.{' '}
          {allowedToResend && (
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={sendEmailConfirmationLink}>
              Send confirmation email?
            </span>
          )}
          {!allowedToResend && (
            <span>
              Send confirmation email in{' '}
              <Timer
                seconds={60 - moment().diff(moment(lastSent), 'seconds')}
                onElapsed={() => {
                  setLastSent(0);
                }}
              />
            </span>
          )}
        </div>
      }
    />
  );
}
