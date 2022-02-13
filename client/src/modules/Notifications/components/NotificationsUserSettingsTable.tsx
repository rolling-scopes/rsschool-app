import { ChangeEvent, useMemo } from 'react';
import css from 'styled-jsx/css';
import { Table } from 'antd';
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
  onCheck: (dataIndex: string[], record: UserNotificationSettings, event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const columns = useMemo(() => buildColumns(onCheck, disabledChannels), [onCheck, disabledChannels]);

  return (
    <>
      <Table
        size="small"
        style={{ marginTop: 8 }}
        dataSource={notifications}
        rowKey="name"
        columns={columns}
        pagination={false}
      />
      {columnStyles}
      {disabledStyles}
    </>
  );
}

const { className: columnClassName, styles: columnStyles } = css.resolve`
  & {
    text-transform: capitalize;
  }
`;

const { className: disabledClassName, styles: disabledStyles } = css.resolve`
  td {
    cursor: no-drop;
  }
  td > :global(*) {
    opacity: 0.2;
    pointer-events: none;
  }
`;

function buildColumns(
  onCheck: (dataIndex: string[], record: UserNotificationSettings, event: ChangeEvent<HTMLInputElement>) => void,
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
    .map<ColumnType<UserNotificationSettings>>(channel => {
      const dataIndex = ['settings', channel];
      return {
        align: 'center',
        className: `${columnClassName} ${
          disabledChannels.includes(channel as NotificationChannel) ? disabledClassName : ''
        }`,
        title: channel,
        dataIndex,
        render: buildCheckBoxRenderer<UserNotificationSettings>(dataIndex, onCheck),
      };
    }),
  );
}
