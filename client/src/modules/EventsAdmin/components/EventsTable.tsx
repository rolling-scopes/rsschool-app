import { Table, Typography } from 'antd';
import { stringSorter, stringTrimRenderer, getColumnSearchProps } from '@client/shared/components/Table';
import { EventDto } from '@client/api';
import { CustomPopconfirm } from 'components/common/CustomPopconfirm';
import { ColumnsType } from 'antd/lib/table';

type Props = {
  data: EventDto[];
  onEdit: (record: EventDto) => void;
  onDelete: (id: number) => void;
};

export function EventsTable({ data, onEdit, onDelete }: Props) {
  return (
    <Table
      size="small"
      style={{ marginTop: 8 }}
      dataSource={data}
      pagination={{ pageSize: 100 }}
      rowKey="id"
      columns={getColumns(onEdit, onDelete) as ColumnsType<EventDto>}
    />
  );
}

function getColumns(handleEditItem: (record: EventDto) => void, handleDeleteItem: (id: number) => void) {
  return [
    {
      title: 'Id',
      dataIndex: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: stringSorter<EventDto>('name'),
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Discipline',
      dataIndex: ['discipline', 'name'],
    },
    {
      title: 'Description URL',
      dataIndex: 'descriptionUrl',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: stringTrimRenderer,
    },
    {
      title: 'Type',
      dataIndex: 'type',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      width: 100,
      render: (_: any, record: EventDto) => (
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
