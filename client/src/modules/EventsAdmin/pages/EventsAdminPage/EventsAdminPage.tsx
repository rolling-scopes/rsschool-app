import { Button, Layout, message } from 'antd';
import { useCallback, useState } from 'react';
import { EventDto } from '@client/api';
import { AdminPageLayout } from '@client/shared/components/PageLayout';
import { EventsTable } from '../../components/EventsTable';
import { EventsModal } from '../../components/EventsModal';
import { useEvents } from '../../hooks/useEvents';
import { useActiveCourseContext } from 'modules/Course/contexts';
import { CreateEventDto } from '@client/api';

const { Content } = Layout;

export function EventsAdminPage() {
  const { courses } = useActiveCourseContext();
  const { data, disciplines, loading, createEvent, updateEvent, deleteEvent } = useEvents();
  const [modalData, setModalData] = useState<Partial<EventDto> | null>(null);
  const [modalAction, setModalAction] = useState('update');

  const handleAddItem = () => {
    setModalData({});
    setModalAction('create');
  };

  const handleEditItem = (record: EventDto) => {
    setModalData(record);
    setModalAction('update');
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteEvent(id);
    } catch {
      message.error('Failed to delete item. Please try later.');
    }
  };

  const handleModalSubmit = useCallback(
    async (values: any) => {
      try {
        const record: CreateEventDto = {
          name: values.name,
          description: values.description,
          descriptionUrl: values.descriptionUrl,
          type: values.type,
          disciplineId: values.disciplineId,
        };
        if (modalAction === 'update') {
          await updateEvent(modalData!.id!, record);
        } else {
          await createEvent(record);
        }
        setModalData(null);
      } catch (e) {
        console.error(e);
        message.error('An error occurred. Can not save event.');
      }
    },
    [modalAction, modalData, createEvent, updateEvent],
  );

  function getInitialValues(modalData: Partial<EventDto>) {
    return { ...modalData, disciplineId: modalData.discipline?.id };
  }

  return (
    <AdminPageLayout title="Manage Events" loading={loading} courses={courses}>
      <Content style={{ margin: 8 }}>
        <Button type="primary" onClick={handleAddItem}>
          Add Event
        </Button>
        <EventsTable data={data} onEdit={handleEditItem} onDelete={handleDeleteItem} />
      </Content>
      <EventsModal
        data={modalData}
        title="Event"
        submit={handleModalSubmit}
        cancel={() => setModalData(null)}
        getInitialValues={getInitialValues}
        disciplines={disciplines}
      />
    </AdminPageLayout>
  );
}
