import { useState, useMemo, ChangeEvent, useCallback } from 'react';
import { Button, message, Space, Spin } from 'antd';
import { NotificationsService, Notification } from 'modules/Notifications/services/notifications';
import { set } from 'lodash';
import { useLoading } from 'components/useLoading';
import { useAsync } from 'react-use';
import { NotificationsTable } from '../../components/NotificationsTable';

export function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, withLoading] = useLoading(false);
  const service = useMemo(() => new NotificationsService(), []);

  const loadData = useCallback(
    withLoading(async () => {
      setNotifications(await service.getNotificationsSettings());
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

  return (
    <Spin spinning={loading}>
      <Space direction="horizontal" style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={saveSettings}>
          Save
        </Button>
      </Space>
      <NotificationsTable notifications={notifications} onCheck={onCheck} />
    </Spin>
  );

  async function saveSettings() {
    try {
      await service.saveNotificationSettings(notifications);
      message.success('New notification settings saved.');
    } catch {
      message.error('Failed to save settings.');
    }
  }
}
