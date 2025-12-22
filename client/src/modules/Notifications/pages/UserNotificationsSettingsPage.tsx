import { useState, useMemo, useCallback } from 'react';
import { Button, Space } from 'antd';
import {
  NotificationsService,
  NotificationChannel,
  UserNotificationSettings,
} from 'modules/Notifications/services/notifications';
import set from 'lodash/set';
import { useLoading } from 'components/useLoading';
import { useAsync } from 'react-use';
import { PageLayout } from '@client/shared/components/PageLayout';
import { NotificationsTable } from '../components/NotificationsUserSettingsTable';
import { Consents, Connection } from '../components/Consents';
import { UpdateNotificationUserSettingsDto } from '@client/api';
import { useMessage } from 'hooks';

export function UserNotificationsPage() {
  const { message } = useMessage();
  const [notifications, setNotifications] = useState<UserNotificationSettings[]>([]);
  const [loading, withLoading] = useLoading(false);
  const service = useMemo(() => new NotificationsService(), []);
  const [email, setEmail] = useState<Connection>();
  const [telegram, setTelegram] = useState<Connection>();
  const [discord, setDiscord] = useState<Connection>();
  const [disabledChannels, setDisabledChannels] = useState<NotificationChannel[]>([]);

  const loadData = useCallback(
    withLoading(async () => {
      const { connections, notifications } = await service.getUserNotificationSettings();
      setNotifications(notifications);

      const { email, telegram, discord } = connections as Record<NotificationChannel, Connection | undefined>;
      setEmail(email);
      setTelegram(telegram);
      setDiscord(discord);
      const hasEmail = !!email?.enabled;
      const hasTelegram = !!telegram?.enabled;
      const hasDiscord = !!discord?.enabled;

      const disabledChannels = [];
      if (!hasEmail) {
        disabledChannels.push(NotificationChannel.email);
      }
      if (!hasTelegram) {
        disabledChannels.push(NotificationChannel.telegram);
      }
      if (!hasDiscord) {
        disabledChannels.push(NotificationChannel.discord);
      }
      setDisabledChannels(disabledChannels);
    }),
    [],
  );

  useAsync(loadData, []);

  const onCheck = useCallback(
    async (dataIndex: string[], record: UserNotificationSettings, checked: boolean) => {
      const newData = [...notifications];
      const index = notifications.findIndex(item => record.id === item.id);
      if (index >= 0 && newData[index]) {
        newData[index] = { ...newData[index] };
        const notification = newData[index];
        if (notification) {
          set(notification, dataIndex, checked);
        }
      }

      setNotifications(newData);
    },
    [notifications],
  );

  const hasConnections = Object.keys(NotificationChannel).length !== disabledChannels.length;

  return (
    <PageLayout loading={loading} title="Notifications" showCourseName>
      <Space direction="vertical" style={{ width: '100%' }}>
        {!loading && <Consents email={email} telegram={telegram} discord={discord} />}
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
      await service.saveUserNotifications(
        notifications.reduce((raw: UpdateNotificationUserSettingsDto[], notification) => {
          Object.keys(notification.settings).forEach(channelId => {
            raw.push({
              channelId,
              enabled: (notification.settings as Record<string, boolean>)[channelId] ?? false,
              notificationId: notification.id,
            });
          });
          return raw;
        }, []),
      );
      message.success('New notification settings saved.');
    } catch {
      message.error('Failed to save settings.');
    }
  }
}
