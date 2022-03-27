import { Button, Modal, Space, Table } from 'antd';
import { IDiscipline } from '../model';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { DisciplineService } from '../../../services/discipline';

const { Column } = Table;

const { confirm } = Modal;

interface IDisciplineTable {
  disciplines: IDiscipline[];
  loadDisciplines: () => Promise<void>;
  handleUpdate: (record: IDiscipline) => void;
}

export const DisciplineTable = ({ disciplines, loadDisciplines, handleUpdate }: IDisciplineTable) => {
  const disciplineService = useMemo(() => new DisciplineService(), []);

  const deleteDisciplineHandler = (record: IDiscipline) => {
    confirm({
      title: 'Do you want to delete this discipline?',
      icon: <ExclamationCircleOutlined />,
      content: 'Some descriptions',
      async onOk() {
        await disciplineService.deleteDiscipline(record.id);
        await loadDisciplines();
      },
    });
  };

  const updateDisciplineHandler = (record: IDiscipline) => {
    handleUpdate(record);
  };

  return (
    <>
      <Table dataSource={disciplines} rowKey={'name'}>
        <Column title="Discipline" dataIndex="name" key="name" />
        <Column
          title="Actions"
          key="action"
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
