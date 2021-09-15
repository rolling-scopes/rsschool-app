import { Button, Modal, Space, Table } from 'antd';
import { IDiscipline } from '../model';
import { DeleteOutlined, ExclamationCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { DisciplineModal } from './DisciplineModal';
import { DisciplineService } from '../../../services/discipline';
import { useDisciplineContext } from '../contexts/DisciplineContext';
import { deleteDiscipline } from '../reducers/actions';

const { Column } = Table;

const { confirm } = Modal;

export const DisciplineTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [discipline, setDiscipline] = useState<IDiscipline>({} as IDiscipline);
  const disciplineService = useMemo(() => new DisciplineService(), []);
  const { disciplines, dispatch } = useDisciplineContext();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const deleteDisciplineHandler = (record: IDiscipline) => {
    confirm({
      title: 'Do you want to delete this discipline?',
      icon: <ExclamationCircleOutlined />,
      content: 'Some descriptions',
      async onOk() {
        const res = await disciplineService.deleteDiscipline(record.id);
        deleteDiscipline(dispatch, [res]);
      },
    });
  };

  const updateDisciplineHandler = (record: IDiscipline) => {
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
              <Button key={'edit'} onClick={() => updateDisciplineHandler(record)}>
                <SettingOutlined />
              </Button>
              <Button key={'delete'} onClick={() => deleteDisciplineHandler(record)} danger>
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
