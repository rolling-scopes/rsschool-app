import { Button, Modal, Space, Table } from 'antd';
import { IDiscipline } from '../model';
import { DeleteOutlined, ExclamationCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { DisciplineModal } from './DisciplineModal';
import { DisciplineService } from '../../../services/discipline';

const { Column } = Table;

const { confirm } = Modal;

interface IDisciplineTable {
  disciplines: IDiscipline[];
}

export const DisciplineTable = ({ disciplines }: IDisciplineTable) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [discipline, setDiscipline] = useState<IDiscipline>({} as IDiscipline);
  const disciplineService = useMemo(() => new DisciplineService(), []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const deleteDiscipline = (record: IDiscipline) => {
    confirm({
      title: 'Do you want to delete this discipline?',
      icon: <ExclamationCircleOutlined />,
      content: 'Some descriptions',
      onOk() {
        disciplineService.deleteDiscipline(record.id);
      },
    });
  };

  const updateDiscipline = (record: IDiscipline) => {
    showModal();
    setDiscipline(record);
  };

  return (
    <>
      <Table dataSource={disciplines} rowKey={'name'}>
        <Column title="Discipline" dataIndex="name" key="name" />
        <Column
          title="Action"
          key="action"
          render={record => (
            <Space size="middle">
              <Button key={'edit'} onClick={() => updateDiscipline(record)}>
                <SettingOutlined />
              </Button>
              <Button key={'delete'} onClick={() => deleteDiscipline(record)} danger>
                <DeleteOutlined />
              </Button>
            </Space>
          )}
        />
      </Table>
      <DisciplineModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} discipline={discipline} />
    </>
  );
};
