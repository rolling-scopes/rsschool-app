import { ChangeEvent, useMemo } from 'react';
import css from 'styled-jsx/css';
import { Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { buildCheckBoxRenderer } from 'components/Table';
import { NotificationChannel, Notification } from '../services/notifications';

export function NotificationsTable({
  notifications,
  disabledChannels,
  onCheck,
}: {
  notifications: Notification[];
  disabledChannels?: NotificationChannel[];
  onCheck: (dataIndex: string[], record: Notification, event: ChangeEvent<HTMLInputElement>) => void;
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
    opacity: 0.3;
  }
  td > :global(*) {
    pointer-events: none;
  }
`;

function buildColumns(
  onCheck: (dataIndex: string[], record: Notification, event: ChangeEvent<HTMLInputElement>) => void,
  disabledChannels: NotificationChannel[] = [],
) {
  const columns: ColumnType<Notification>[] = [
    {
      title: 'Notification',
      dataIndex: ['name'],
    },
  ];

  return columns.concat(
    Object.keys(NotificationChannel).map<ColumnType<Notification>>(channel => {
      const dataIndex = ['channels', channel];
      return {
        align: 'center',
        className: `${columnClassName} ${
          disabledChannels.includes(channel as NotificationChannel) ? disabledClassName : ''
        }`,
        title: channel,
        dataIndex,
        render: buildCheckBoxRenderer<Notification>(dataIndex, onCheck),
      };
    }),
  );
}
