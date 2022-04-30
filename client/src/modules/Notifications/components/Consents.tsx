import { message, Alert, Space } from 'antd';
import { EmailConfirmation } from 'components/Profile/EmailConfirmation';
import discordIntegration from 'configs/discord-integration';
import { useCallback } from 'react';
import { UserService } from 'services/user';

const rsschoolBotLink = 'https://t.me/rsschool_bot?start=connect';

export type Connection = {
  value: string;
  enabled: boolean;
  lastLinkSentAt?: string;
};

export function Consents({
  email,
  telegram,
  discord,
}: {
  email?: Connection;
  telegram?: Connection;
  discord?: Connection;
}) {
  const hasEmail = !!email?.enabled;
  const hasTelegram = !!telegram?.enabled;
  const hasDiscord = !!discord?.enabled;

  if (hasEmail && hasTelegram && hasDiscord) return null;

  const emailAdded = email?.value;
  const emailVerified = email?.enabled;

  const sendEmailConfirmationLink = useCallback(async () => {
    try {
      await new UserService().sendEmailConfirmationLink();
    } catch (e) {
      message.error('Error has occured. Please try again later');
    }
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {!hasTelegram && (
        <Alert
          message={
            <div>
              Note: To enable telegram notifications please open the <a href={rsschoolBotLink}>@rsschool_bot</a> and
              click the <b>Start</b> button to set it up
            </div>
          }
          type="info"
        />
      )}

      {!hasDiscord && (
        <Alert
          message={
            <div>
              Note: To enable discord notifications please <a href={discordIntegration.api.auth}>authorize</a> first
            </div>
          }
          type="info"
        />
      )}
      {!emailAdded && (
        <Alert
          message={
            <div>
              To set up email notification, please enter your email on <a href="/profile#edit">Profile</a> page
            </div>
          }
          type="info"
        />
      )}
      {emailAdded && !emailVerified && (
        <EmailConfirmation connection={email} sendConfirmationEmail={sendEmailConfirmationLink} />
      )}
    </Space>
  );
}
