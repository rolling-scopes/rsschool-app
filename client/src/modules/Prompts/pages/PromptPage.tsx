import { Button, Layout, message } from 'antd';
import { PromptDto, PromptsApi } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { useCallback, useContext, useState } from 'react';
import { useAsync } from 'react-use';
import { PromptModal } from '../components/PromptModal';
import { PromptTable } from '../components/PromptTable';

const api = new PromptsApi();

export const PromptsPage = () => {
  const session = useContext(SessionContext);
  const [prompts, setPrompts] = useState([] as PromptDto[]);
  const [prompt, setPrompt] = useState<PromptDto | null>(null);

  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadDisciplines = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.getPrompts();
      setPrompts(data);
    } catch (e) {
      message.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (record: PromptDto) => {
    await api.deletePrompt(record.id);
    await loadDisciplines();
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setPrompt(null);
  };

  const handleModalShow = () => {
    setIsModalVisible(true);
  };

  const handleModalShowUpdate = (record: PromptDto) => {
    setPrompt(record);
    setIsModalVisible(true);
  };

  useAsync(loadDisciplines, []);

  return (
    <AdminPageLayout session={session} title="Manage Prompts" loading={loading} courses={[]}>
      <Layout.Content style={{ margin: 8 }}>
        <Button type="primary" onClick={handleModalShow} style={{ marginBottom: '25px' }}>
          Add Prompt
        </Button>
        <PromptTable data={prompts || []} handleUpdate={handleModalShowUpdate} handleDelete={handleDelete} />
      </Layout.Content>
      <PromptModal
        isModalVisible={isModalVisible}
        onCancel={handleModalCancel}
        loadData={loadDisciplines}
        data={prompt}
      />
    </AdminPageLayout>
  );
};
