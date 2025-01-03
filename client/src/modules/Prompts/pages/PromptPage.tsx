import { Button, Layout, message } from 'antd';
import { PromptDto, PromptsApi } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import { useModalForm } from 'hooks';
import { useActiveCourseContext } from 'modules/Course/contexts';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { PromptModal } from '../components/PromptModal';
import { PromptTable } from '../components/PromptTable';

const api = new PromptsApi();

export const PromptsPage = () => {
  const { courses } = useActiveCourseContext();

  const [prompts, setPrompts] = useState([] as PromptDto[]);
  const { open, formData, toggle } = useModalForm<PromptDto>();

  const [loading, setLoading] = useState(false);

  const loadDisciplines = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.getPrompts();
      setPrompts(data);
    } catch {
      message.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (record: PromptDto) => {
    await api.deletePrompt(record.id);
    await loadDisciplines();
  };

  const handleModalShowUpdate = (record: PromptDto) => {
    toggle(record);
  };

  useAsync(loadDisciplines, []);

  return (
    <AdminPageLayout title="Manage Prompts" loading={loading} courses={courses}>
      <Layout.Content style={{ margin: 8 }}>
        <Button type="primary" onClick={() => toggle()} style={{ marginBottom: '25px' }}>
          Add Prompt
        </Button>
        <PromptTable data={prompts || []} handleUpdate={handleModalShowUpdate} handleDelete={handleDelete} />
      </Layout.Content>

      <PromptModal open={open} onCancel={() => toggle()} loadData={loadDisciplines} data={formData} />
    </AdminPageLayout>
  );
};
