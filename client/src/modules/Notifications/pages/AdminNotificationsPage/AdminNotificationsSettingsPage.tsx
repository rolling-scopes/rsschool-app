import { useState, useMemo, useCallback, ReactNode } from 'react';
import { useRequest } from 'ahooks';
import { Button, Spin } from 'antd';
import { NotificationsService } from '@client/modules/Notifications/services/notifications';
import { useAsync } from 'react-use';
import { NotificationSettingsTable } from '@client/modules/Notifications/components/NotificationSettingsTable';
import { NotificationSettingsModal } from '@client/modules/Notifications/components/NotificationSettingsModal';
import { NotificationDto } from '@client/api';
import { useMessage } from '@client/hooks';

export function AdminNotificationsPage() {
  const { message } = useMessage();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const { loading, runAsync: loadData } = useRequest(
    async () => {
      setNotifications(await service.getNotifications());
    },
    { manual: true },
  );
  const service = useMemo(() => new NotificationsService(), []);
  const [modal, setModal] = useState<ReactNode>();

  useAsync(loadData, []);

  const edit = useCallback(
    (notification: NotificationDto) => {
      setModal(
        <NotificationSettingsModal
          notifications={notifications}
          notification={notification}
          onCancel={() => setModal(undefined)}
          onOk={saveNotification}
        />,
      );
    },
    [saveNotification, notifications],
  );

  const create = useCallback(() => {
    setModal(
      <NotificationSettingsModal
        onCancel={() => setModal(undefined)}
        onOk={saveNotification}
        notifications={notifications}
      />,
    );
  }, [notifications]);

  return (
    <Spin spinning={loading}>
      <Button type="primary" onClick={create}>
        Add Notification
      </Button>
      <NotificationSettingsTable onEdit={edit} onDelete={deleteNotification} notifications={notifications} />
      {modal}
    </Spin>
  );

  async function saveNotification(notification: NotificationDto) {
    try {
      const isSave = notifications.find(({ id }) => notification.id === id);
      const { data } = await (isSave
        ? service.saveNotification(notification)
        : service.createNotification(notification));

      setNotifications(notifications => {
        return isSave
          ? notifications.map(notification => (notification.id === data.id ? data : notification))
          : [...notifications, data];
      });
      setModal(null);
      message.success('New notification settings saved.');
    } catch {
      message.error('Failed to save settings.');
    }
  }

  async function deleteNotification(notification: NotificationDto) {
    try {
      await service.deleteNotification(notification.id);
      setNotifications(notifications => notifications.filter(n => n.id !== notification.id));
      message.success('Notification is deleted.');
    } catch {
      message.error('Failed to delete notification.');
    }
  }
}
