import { Button, Layout, message } from 'antd';
import { useCallback, useState } from 'react';
import { DiscordServerDto, UpdateDiscordServerDto } from '@client/api';
import { AdminPageLayout } from '@client/shared/components/PageLayout';
import { DiscordServersTable } from '../../components/DiscordServersTable';
import { DiscordServersModal } from '../../components/DiscordServersModal';
import { useDiscordServers } from '../../hooks/useDiscordServers';
import { useActiveCourseContext } from 'modules/Course/contexts';

const { Content } = Layout;

enum ModalAction {
  update = 'update',
  create = 'create',
}

export function DiscordAdminPage() {
  const { courses } = useActiveCourseContext();
  const { data, loading, createServer, updateServer, deleteServer } = useDiscordServers();
  const [modalData, setModalData] = useState<Partial<DiscordServerDto> | null>(null);
  const [modalAction, setModalAction] = useState(ModalAction.update);
  const [modalLoading, setModalLoading] = useState(false);

  const handleAddItem = () => {
    setModalData({});
    setModalAction(ModalAction.create);
  };

  const handleEditItem = (record: DiscordServerDto) => {
    setModalData(record);
    setModalAction(ModalAction.update);
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteServer(id);
    } catch {
      message.error('Failed to delete discord/telegram channel. Please try later.');
    }
  };

  const handleModalSubmit = useCallback(
    async (values: UpdateDiscordServerDto) => {
      try {
        if (modalLoading) {
          return;
        }
        setModalLoading(true);
        if (modalAction === ModalAction.update) {
          await updateServer(modalData!.id!, values);
        } else {
          await createServer(values);
        }
        setModalData(null);
      } catch {
        message.error('An error occurred. Cannot save discord/telegram channel.');
      } finally {
        setModalLoading(false);
      }
    },
    [modalAction, modalData, modalLoading, createServer, updateServer],
  );

  function getInitialValues(modalData: Partial<DiscordServerDto>) {
    return modalData;
  }

  return (
    <AdminPageLayout title="Manage Discord/Telegram" loading={loading} courses={courses}>
      <Content style={{ margin: 8 }}>
        <Button type="primary" onClick={handleAddItem}>
          Add Discord/Telegram channel
        </Button>
        <DiscordServersTable data={data} onEdit={handleEditItem} onDelete={handleDeleteItem} />
      </Content>
      <DiscordServersModal
        data={modalData}
        title="Discord/Telegram channel"
        submit={handleModalSubmit}
        cancel={() => setModalData(null)}
        getInitialValues={getInitialValues}
        loading={modalLoading}
      />
    </AdminPageLayout>
  );
}
