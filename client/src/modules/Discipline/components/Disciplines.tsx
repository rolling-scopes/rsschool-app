import type { Session } from 'components/withSession';
import { isAdmin } from '../../../domain/user';
import { Button, Layout } from 'antd';
import { useEffect, useState } from 'react';
import { IDiscipline } from '../model';
import { DisciplineTable } from './DisciplineTable';
import { useDisciplineContext } from '../contexts/DisciplineContext';
import { loadAllDisciplines } from '../reducers/actions';
import { AdminSider } from '../../../components/AdminSider';
import { Header } from '../../../components/Header';
import { DisciplineModal } from './DisciplineModal';

const { Content } = Layout;

type IDisciplines = { session: Session; disciplines?: IDiscipline[] };

export const Disciplines = ({ session, disciplines }: IDisciplines) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { dispatch } = useDisciplineContext();

  useEffect(() => {
    if (disciplines) loadAllDisciplines(dispatch, disciplines);
  }, [disciplines]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={session.isAdmin} isCoursePowerUser={isAdmin(session)} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Manage Disciplines" username={session.githubId} />
        <Content style={{ margin: 8 }}>
          <Button type="primary" onClick={showModal} style={{ marginBottom: '25px' }}>
            Add Disciplines
          </Button>
          <DisciplineTable />
          <DisciplineModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} />
        </Content>
      </Layout>
    </Layout>
  );
};
