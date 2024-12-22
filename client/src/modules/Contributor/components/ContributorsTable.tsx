import { Button, Space, Table } from 'antd';
import { ContributorDto } from 'api';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { GithubAvatar } from 'components/GithubAvatar';

const { Column } = Table;

type Props = {
  data: ContributorDto[];
  handleUpdate: (record: ContributorDto) => void;
  handleDelete: (record: ContributorDto) => Promise<void>;
};

export const ContributorsTable = ({ data: disciplines, handleDelete, handleUpdate }: Props) => {
  return (
    <Table dataSource={disciplines} rowKey="id">
      <Column
        title="User"
        dataIndex={['user', 'githubId']}
        render={(value: string) => {
          return (
            <>
              <GithubAvatar size={24} githubId={value} /> {value}
            </>
          );
        }}
      />
      <Column title="Description" dataIndex="description" />
      <Column
        title="Actions"
        key="action"
        width={100}
        render={record => (
          <Space size="middle">
            <Button key={'edit'} onClick={() => handleUpdate(record)} size="small">
              <EditOutlined size={8} />
            </Button>
            <Button key={'delete'} onClick={() => handleDelete(record)} size="small" danger>
              <DeleteOutlined size={8} />
            </Button>
          </Space>
        )}
      />
    </Table>
  );
};
