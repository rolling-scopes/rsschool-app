import type { Session } from 'components/withSession';
import { isAdmin } from '../../../domain/user';
import { Button, Layout, message } from 'antd';
import { useMemo, useState } from 'react';
import { IDiscipline } from '../model';
import { AdminSider } from '../../../components/AdminSider';
import { Header } from '../../../components/Header';
import { DisciplineService } from '../../../services/discipline';
import { DisciplineTable } from './DisciplineTable';
import { DisciplineModal } from './DisciplineModal';

const { Content } = Layout;

type IDisciplines = { session: Session; disciplines?: IDiscipline[] };

export const Disciplines = (props: IDisciplines) => {
  const { session } = props;
  const [disciplines, setDisciplines] = useState(props.disciplines);
  const [discipline, setDiscipline] = useState<IDiscipline | null>(null);
  const disciplineService = useMemo(() => new DisciplineService(), []);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const handleModalShowUpdate = (discipline: IDiscipline) => {
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
