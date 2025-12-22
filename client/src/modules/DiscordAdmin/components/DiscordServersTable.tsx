import { Table, Typography } from 'antd';
import { stringSorter } from '@client/shared/components/Table';
import { DiscordServerDto } from '@client/api';
import { CustomPopconfirm } from 'components/common/CustomPopconfirm';

type Props = {
  data: DiscordServerDto[];
  onEdit: (record: DiscordServerDto) => void;
  onDelete: (id: number) => void;
};

export function DiscordServersTable({ data, onEdit, onDelete }: Props) {
  return (
    <Table
      size="small"
      style={{ marginTop: 8 }}
      dataSource={data}
      pagination={{ pageSize: 100 }}
      rowKey="id"
      columns={getColumns(onEdit, onDelete)}
    />
  );
}

function getColumns(handleEditItem: (record: DiscordServerDto) => void, handleDeleteItem: (id: number) => void) {
  return [
    {
      title: 'Id',
      dataIndex: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: stringSorter<DiscordServerDto>('name'),
    },
    {
      title: 'Gratitude URL',
      dataIndex: 'gratitudeUrl',
      sorter: stringSorter<DiscordServerDto>('gratitudeUrl'),
    },
    {
      title: 'Mentors chat URL',
      dataIndex: 'mentorsChatUrl',
      sorter: stringSorter<DiscordServerDto>('mentorsChatUrl'),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_: any, record: DiscordServerDto) => (
        <>
          <span>
            <Typography.Link onClick={() => handleEditItem(record)}>Edit</Typography.Link>{' '}
          </span>
          <span style={{ marginLeft: 8 }}>
            <CustomPopconfirm
              onConfirm={() => handleDeleteItem(record.id)}
              title="Are you sure you want to delete this item?"
            >
              <Typography.Link>Delete</Typography.Link>
            </CustomPopconfirm>
          </span>
        </>
      ),
    },
  ];
}
