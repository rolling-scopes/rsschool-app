import { Popconfirm, Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { NotificationDto } from 'api';
import { boolIconRenderer } from 'components/Table';
import { useMemo } from 'react';

export function NotificationSettingsTable({
  notifications,
  onEdit,
  onDelete,
}: {
  notifications: NotificationDto[];
  onEdit: (record: NotificationDto) => void;
  onDelete: (record: NotificationDto) => void;
}) {
  const columns = useMemo(() => buildColumns(onEdit, onDelete), [onEdit]);

  return (
    <>
      <Table
        size="small"
        style={{ marginTop: 8 }}
        dataSource={notifications}
        rowKey="id"
        columns={columns}
        pagination={false}
      />
    </>
  );
}

function buildColumns(onEdit: (record: NotificationDto) => void, onDelete: (record: NotificationDto) => void) {
  const columns: ColumnType<NotificationDto>[] = [
    {
      title: 'Notification',
      dataIndex: ['name'],
    },
    {
      title: 'Active',
      dataIndex: ['enabled'],
      align: 'center',
      render: boolIconRenderer,
    },
    {
      title: 'Actions',
      align: 'center',
      render: (_: unknown, record: any) => (
        <>
          <div>
            <a onClick={() => onEdit(record)}>Edit</a>
          </div>
          <div>
            <Popconfirm
              title="Are you sure to delete this notification?"
              onConfirm={() => onDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <a>Delete</a>
            </Popconfirm>
          </div>
        </>
      ),
    },
  ];

  return columns;
}
