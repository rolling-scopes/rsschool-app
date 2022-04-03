import { DisciplineDto } from 'api';
import { isAdmin } from '../../../domain/user';
import { Button, Layout, message, Result } from 'antd';
import React, { useContext, useMemo, useState } from 'react';
import { AdminSider } from '../../../components/AdminSider';
import { Header } from '../../../components/Header';
import { DisciplineService } from '../../../services/discipline';
import { DisciplineTable } from './DisciplineTable';
import { DisciplineModal } from './DisciplineModal';
import { SessionContext } from '../../Course/contexts';

const { Content } = Layout;

type IDisciplines = { disciplines?: DisciplineDto[] };

export const Disciplines = (props: IDisciplines) => {
  const session = useContext(SessionContext);
  const [disciplines, setDisciplines] = useState(props.disciplines);
  const [discipline, setDiscipline] = useState<DisciplineDto | null>(null);
  const disciplineService = useMemo(() => new DisciplineService(), []);
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!session?.isAdmin) {
    return (
      <>
        <Header username={session.githubId} />
        <Result status="403" title="Sorry, but you don't have access to this page" />
      </>
    );
  }

  const loadDisciplines = async () => {
    try {
      const disciplines = await disciplineService.getAllDisciplines();
      setDisciplines(disciplines);
    } catch (e) {
      message.error('Something went wrong. Please try again later.');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setDiscipline(null);
  };

  const handleModalShow = () => {
    setIsModalVisible(true);
  };

  const handleModalShowUpdate = (discipline: DisciplineDto) => {
    setDiscipline(discipline);
    setIsModalVisible(true);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={session.isAdmin} isCoursePowerUser={isAdmin(session)} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Manage Disciplines" username={session.githubId} />
        <Content style={{ margin: 8 }}>
          <Button type="primary" onClick={handleModalShow} style={{ marginBottom: '25px' }}>
            Add Disciplines
          </Button>
          <DisciplineTable
            disciplines={disciplines || []}
            loadDisciplines={loadDisciplines}
            handleUpdate={handleModalShowUpdate}
          />
        </Content>
      </Layout>
      <DisciplineModal
        isModalVisible={isModalVisible}
        onCancel={handleModalCancel}
        loadDisciplines={loadDisciplines}
        discipline={discipline}
      />
    </Layout>
  );
};
