import { Button, Modal, Space, Table } from 'antd';
import { DisciplineDto } from 'api';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Column } = Table;
const { confirm } = Modal;
interface IDisciplineTable {
  disciplines: DisciplineDto[];
  handleUpdate: (record: DisciplineDto) => void;
  handleDelete: (record: DisciplineDto) => Promise<void>;
}

export const DisciplineTable = ({ disciplines, handleDelete, handleUpdate }: IDisciplineTable) => {
  const deleteDisciplineHandler = (record: DisciplineDto) => {
    confirm({
      title: 'Do you want to delete this discipline?',
      icon: <ExclamationCircleOutlined />,
      content: 'Some descriptions',
      async onOk() {
        await handleDelete(record);
      },
    });
  };

  const updateDisciplineHandler = (record: DisciplineDto) => {
    handleUpdate(record);
  };

  return (
    <>
      <Table dataSource={disciplines} rowKey={'name'}>
        <Column title="Discipline" dataIndex="name" key="name" />
        <Column
          title="Actions"
          key="action"
          width={100}
          render={record => (
            <Space size="middle">
              <Button key={'edit'} onClick={() => updateDisciplineHandler(record)} size="small">
                <EditOutlined size={8} />
              </Button>
              <Button key={'delete'} onClick={() => deleteDisciplineHandler(record)} size="small" danger>
                <DeleteOutlined size={8} />
              </Button>
            </Space>
          )}
        />
      </Table>
    </>
  );
};
