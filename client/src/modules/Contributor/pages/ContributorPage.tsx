import { useRequest } from 'ahooks';
import { Button, Layout } from 'antd';
import { ContributorDto, ContributorsApi } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import { useActiveCourseContext } from 'modules/Course/contexts';
import { ContributorModal } from '../components/ContributorModal';
import { ContributorsTable } from '../components/ContributorsTable';
import { useState } from 'react';

const api = new ContributorsApi();

export const ContributorPage = () => {
  const { courses } = useActiveCourseContext();
  const [modalId, setModalId] = useState<number | null | undefined>();

  const response = useRequest(async () => {
    const { data } = await api.getContributors();
    return data;
  });

  const handleDelete = async (record: ContributorDto) => {
    await api.deleteContributor(record.id);
    response.run();
  };

  const handleUpdate = async (record: ContributorDto) => {
    setModalId(record.id);
  };

  const handleClose = () => {
    setModalId(undefined);
    response.run();
  };

  return (
    <AdminPageLayout title="Manage Contributors" loading={response.loading} courses={courses}>
      <Layout.Content style={{ margin: 8 }}>
        <Button type="primary" style={{ marginBottom: '25px' }} onClick={() => setModalId(null)}>
          Add Contributor
        </Button>
        <ContributorsTable data={response.data ?? []} handleUpdate={handleUpdate} handleDelete={handleDelete} />
      </Layout.Content>
      {modalId !== undefined ? <ContributorModal onClose={handleClose} contributorId={modalId} /> : null}
    </AdminPageLayout>
  );
};
