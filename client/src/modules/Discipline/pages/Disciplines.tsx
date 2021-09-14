import { AdminSider, Header, Session } from '../../../components';
import { isAnyCoursePowerUserManager } from '../../../domain/user';
import { Button, Layout } from 'antd';
import { DisciplineModal } from '../components/DisciplineModal';
import { useState } from 'react';
import { IDiscipline } from '../model';
import { DisciplineTable } from '../components/DisciplineTable';

const { Content } = Layout;

type IDisciplines = { session: Session; disciplines?: IDiscipline[] };

export const Disciplines = ({ session, disciplines }: IDisciplines) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={session.isAdmin} isCoursePowerUser={isAnyCoursePowerUserManager(session)} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Manage Disciplines" username={session.githubId} />
        <Content style={{ margin: 8 }}>
          <Button type="primary" onClick={showModal} style={{ marginBottom: '25px' }}>
            Add Disciplines
          </Button>
          <DisciplineTable disciplines={disciplines ?? []} />
          <DisciplineModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} />
        </Content>
      </Layout>
    </Layout>
  );
};
