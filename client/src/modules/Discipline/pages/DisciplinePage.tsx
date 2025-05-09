import { DisciplineDto, DisciplinesApi } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import { DisciplineModal } from '../components/DisciplineModal';
import { useCallback, useState } from 'react';
import { Button, Layout, message } from 'antd';
import { DisciplineTable } from '../components/DisciplineTable';
import { useAsync } from 'react-use';
import { useActiveCourseContext } from 'modules/Course/contexts';

const disciplinesApi = new DisciplinesApi();

export const DisciplinePage = () => {
  const { courses } = useActiveCourseContext();
  const [disciplines, setDisciplines] = useState([] as DisciplineDto[]);
  const [discipline, setDiscipline] = useState<DisciplineDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadDisciplines = useCallback(async () => {
    try {
      setLoading(true);
      const { data: disciplines } = await disciplinesApi.getDisciplines();
      setDisciplines(disciplines);
    } catch {
      message.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (record: DisciplineDto) => {
    await disciplinesApi.deleteDiscipline(record.id);
    await loadDisciplines();
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

  useAsync(loadDisciplines, []);

  return (
    <AdminPageLayout title="Manage Disciplines" loading={loading} courses={courses}>
      <Layout.Content style={{ margin: 8 }}>
        <Button type="primary" onClick={handleModalShow} style={{ marginBottom: '25px' }}>
          Add Disciplines
        </Button>
        <DisciplineTable
          disciplines={disciplines || []}
          handleUpdate={handleModalShowUpdate}
          handleDelete={handleDelete}
        />
      </Layout.Content>
      <DisciplineModal
        isModalVisible={isModalVisible}
        onCancel={handleModalCancel}
        loadDisciplines={loadDisciplines}
        discipline={discipline}
      />
    </AdminPageLayout>
  );
};
