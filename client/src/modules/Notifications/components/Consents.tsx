import { Alert, Space } from 'antd';

const rsschoolBotLink = 'https://t.me/rsschool_bot?start';

export function Consents({ hasEmail, hasTelegram }: { hasEmail: boolean; hasTelegram: boolean }) {
  if (hasEmail && hasTelegram) return null;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {!hasTelegram && (
        <Alert
          message={
            <div>
              Note: To enable telegram notifications please open the{' '}
              <a target="_blank" href={rsschoolBotLink}>
                @rsschool_bot
              </a>{' '}
              and click the <b>Start</b> button to set it up
            </div>
          }
          type="info"
          closable
        />
      )}
      {!hasEmail && (
        <Alert
          message={
            <div>
              To set up email notification, please enter your email on <a href="/profile#edit">Profile</a> page
            </div>
          }
          type="info"
          closable
        />
      )}
    </Space>
  );
}
