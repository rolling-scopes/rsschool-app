import { useState, useMemo, useCallback, ReactNode } from 'react';
import { Button, message, Spin } from 'antd';
import { NotificationsService } from 'modules/Notifications/services/notifications';
import { useLoading } from 'components/useLoading';
import { useAsync } from 'react-use';
import { NotificationSettingsTable } from 'modules/Notifications/components/NotificationSettingsTable';
import { NotificationSettingsModal } from 'modules/Notifications/components/NotificationSettingsModal';
import { NotificationDto } from 'api';

export function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, withLoading] = useLoading(false);
  const service = useMemo(() => new NotificationsService(), []);
  const [modal, setModal] = useState<ReactNode>();

  const loadData = useCallback(
    withLoading(async () => {
      setNotifications(await service.getNotifications());
    }),
    [],
  );

  useAsync(loadData, []);

  const edit = useCallback(
    (notification: NotificationDto) => {
      setModal(
        <NotificationSettingsModal
          notification={notification}
          onCancel={() => setModal(undefined)}
          onOk={saveNotification}
        />,
      );
    },
    [saveNotification],
  );

  const create = useCallback(() => {
    setModal(<NotificationSettingsModal onCancel={() => setModal(undefined)} onOk={saveNotification} />);
  }, []);

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
