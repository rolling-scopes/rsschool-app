import { Table, Tag, Typography } from 'antd';
import { stringSorter } from '@client/shared/components/Table';
import { GithubAvatar } from '@client/shared/components/GithubAvatar';
import { UserGroupDto } from '@client/api';
import { CustomPopconfirm } from 'components/common/CustomPopconfirm';

type Props = {
  data: UserGroupDto[];
  onEdit: (record: UserGroupDto) => void;
  onDelete: (id: number) => void;
};

const rolesColors: Record<string, string> = {
  supervisor: 'purple',
  manager: 'volcano',
};

export function UserGroupsTable({ data, onEdit, onDelete }: Props) {
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

function getColumns(handleEditItem: (record: UserGroupDto) => void, handleDeleteItem: (id: number) => void) {
  return [
    {
      title: 'Id',
      dataIndex: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: stringSorter<UserGroupDto>('name'),
    },
    {
      title: 'Users',
      dataIndex: 'users',
      render: (_: any, record: UserGroupDto) => (
        <div>
          {record.users.map((user, index, array) => (
            <div key={user.id} style={{ display: 'flex', marginBottom: index < array.length - 1 ? 10 : 0 }}>
              <GithubAvatar size={24} githubId={user.githubId} />
              &nbsp;{user.name} ({user.githubId})
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      render: (_: any, record: UserGroupDto) => (
        <div>
          {record.roles.map(role => (
            <Tag color={rolesColors[role]} key={role}>
              {role}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_: any, record: UserGroupDto) => (
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
