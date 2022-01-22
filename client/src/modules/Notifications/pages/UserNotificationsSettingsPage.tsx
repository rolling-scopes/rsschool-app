import { useState, useMemo, ChangeEvent, useCallback } from 'react';
import { Button, message, Space } from 'antd';
import { NotificationsService, Notification, NotificationChannel } from 'modules/Notifications/services/notifications';
import { set } from 'lodash';
import { useLoading } from 'components/useLoading';
import { useAsync } from 'react-use';
import { Session } from 'components/withSession';
import { PageLayout } from 'components/PageLayout';
import { NotificationsTable } from '../components/NotificationsTable';
import { UserService } from 'services/user';
import { Consents } from '../components/Consents';

type Props = { session: Session };

export function UserNotificationsPage(props: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, withLoading] = useLoading(false);
  const service = useMemo(() => new NotificationsService(), []);
  const [hasEmail, setHasEmail] = useState(false);
  const [hasTelegram, setHasTelegram] = useState(false);
  const [disabledChannels, setDisabledChannels] = useState<NotificationChannel[]>([]);

  const loadData = useCallback(
    withLoading(async () => {
      const userService = new UserService();
      const [profile, notifications] = await Promise.all([
        userService.getProfileInfo(props.session.githubId),
        service.getUserNotificationSettings(),
      ]);
      setNotifications(notifications);

      const { contacts } = profile;
      const hasEmail = !!contacts?.email;
      const hasTelegram = !!contacts?.telegram;
      setHasEmail(hasEmail);
      setHasTelegram(hasTelegram);

      const disabledChannels = [];
      if (!hasEmail) {
        disabledChannels.push(NotificationChannel.email);
      }
      if (!hasTelegram) {
        disabledChannels.push(NotificationChannel.telegram);
      }
      setDisabledChannels(disabledChannels);
    }),
    [],
  );

  useAsync(loadData, []);

  const onCheck = useCallback(
    async (dataIndex: string[], record: Notification, event: ChangeEvent<HTMLInputElement>) => {
      const newData = [...notifications];
      const index = notifications.findIndex(item => record.id === item.id);
      newData[index] = { ...newData[index] };
      const notification = newData[index];

      set(notification, dataIndex, event.target.checked);

      setNotifications(newData);
    },
    [notifications],
  );

  const hasConnections = Object.keys(NotificationChannel).length !== disabledChannels.length;

  return (
    <PageLayout loading={loading} title="Notifications" githubId={props.session.githubId}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Consents hasEmail={hasEmail} hasTelegram={hasTelegram} />
        <Space direction="horizontal" style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button disabled={!hasConnections} type="primary" onClick={saveSettings}>
            Save
          </Button>
        </Space>
      </Space>
      <NotificationsTable disabledChannels={disabledChannels} notifications={notifications} onCheck={onCheck} />
    </PageLayout>
  );

  async function saveSettings() {
    try {
      await service.saveUserNotifications(notifications);
      message.success('New notification settings saved.');
    } catch {
      message.error('Failed to save settings.');
    }
  }
}
