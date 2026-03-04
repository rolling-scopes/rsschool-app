import { useMemo } from 'react';
import { Table } from 'antd';

import styles from './NotificationsUserSettingsTable.module.css';
import { ColumnType } from 'antd/lib/table';
import { buildCheckBoxRenderer } from 'components/Table';
import { NotificationChannel, UserNotificationSettings } from '../services/notifications';

export function NotificationsTable({
  notifications,
  disabledChannels,
  onCheck,
}: {
  notifications: UserNotificationSettings[];
  disabledChannels?: NotificationChannel[];
  onCheck: (dataIndex: string[], record: UserNotificationSettings, checked: boolean) => void;
}) {
  const columns = useMemo(() => buildColumns(onCheck, disabledChannels), [onCheck, disabledChannels]);

  return (
    <Table
      size="small"
      style={{ marginTop: 8 }}
      dataSource={notifications}
      rowKey="name"
      columns={columns}
      pagination={false}
    />
  );
}

function buildColumns(
  onCheck: (dataIndex: string[], record: UserNotificationSettings, checked: boolean) => void,
  disabledChannels: NotificationChannel[] = [],
) {
  const columns: ColumnType<UserNotificationSettings>[] = [
    {
      title: 'Notification',
      dataIndex: ['name'],
    },
  ];

  return columns.concat(
    Object.keys(NotificationChannel)
      .filter(channel => channel !== 'discord')
      .map<ColumnType<UserNotificationSettings>>(channel => {
        const dataIndex = ['settings', channel];
        return {
          align: 'center',
          className: `${styles.column} ${
            disabledChannels.includes(channel as NotificationChannel) ? styles.disabled : ''
          }`,
          title: channel,
          dataIndex,
          render: buildCheckBoxRenderer<UserNotificationSettings>(dataIndex, onCheck, channel !== 'discord'),
        };
      }),
  );
}
