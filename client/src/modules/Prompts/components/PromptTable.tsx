import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Space, Table } from 'antd';
import { PromptDto } from 'api';

const { Column } = Table;

type Props = {
  data: PromptDto[];
  handleUpdate: (record: PromptDto) => void;
  handleDelete: (record: PromptDto) => Promise<void>;
};

export const PromptTable = ({ data, handleDelete, handleUpdate }: Props) => {
  return (
    <Table dataSource={data} rowKey={'name'}>
      <Column title="Type" dataIndex="type" key="type" />
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
