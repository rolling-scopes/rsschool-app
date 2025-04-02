import { useState, useCallback } from 'react';
import { Form, Button, Select, message, Input, Table, Layout, Typography } from 'antd';
import { ModalForm } from 'components/Forms';
import { stringSorter, stringTrimRenderer, getColumnSearchProps } from 'components/Table';
import { urlPattern } from 'services/validators';
import { useAsync } from 'react-use';
import { AdminPageLayout } from 'components/PageLayout';
import { CourseRole } from 'services/models';
import { EVENT_TYPES } from 'data/eventTypes';
import { CreateEventDto, DisciplineDto, DisciplinesApi, EventDto, EventsApi } from 'api';
import { ColumnsType } from 'antd/lib/table';
import { ActiveCourseProvider, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { CustomPopconfirm } from 'components/common/CustomPopconfirm';

const { Content } = Layout;

const eventsApi = new EventsApi();
const disciplinesApi = new DisciplinesApi();

function Page() {
  const { courses } = useActiveCourseContext();
  const [data, setData] = useState<EventDto[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [modalData, setModalData] = useState<Partial<EventDto> | null>(null);
  const [modalAction, setModalAction] = useState('update');

  const loadData = async () => {
    const [{ data: events }, { data: disciplines }] = await Promise.all([
      eventsApi.getEvents(),
      disciplinesApi.getDisciplines(),
    ]);
    setData(events);
    setDisciplines(disciplines || []);
  };

  const { loading } = useAsync(loadData, []);

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
      await eventsApi.deleteEvent(id);
      const { data } = await eventsApi.getEvents();
      setData(data);
    } catch {
      message.error('Failed to delete item. Please try later.');
    }
  };

  const handleModalSubmit = useCallback(
    async (values: any) => {
      try {
        const record = createRecord(values);
        if (modalAction === 'update') {
          await eventsApi.updateEvent(modalData!.id!, record);
        } else {
          await eventsApi.createEvent(record);
        }
        setModalData(null);
        await loadData();
      } catch (e) {
        console.error(e);
        message.error('An error occurred. Can not save the task.');
      }
    },
    [modalAction, modalData],
  );

  const renderModal = useCallback(
    () =>
      modalData ? (
        <ModalForm
          data={modalData}
          title="Event"
          submit={handleModalSubmit}
          cancel={() => setModalData(null)}
          getInitialValues={getInitialValues}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter event name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Event Type" rules={[{ required: true, message: 'Please select a type' }]}>
            <Select>
              {EVENT_TYPES.map(({ name, id }) => (
                <Select.Option key={id} value={id}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            required
            name="disciplineId"
            label="Discipline"
            rules={[{ required: true, message: 'Please select a discipline' }]}
          >
            <Select>
              {disciplines.map(({ id, name }) => (
                <Select.Option key={id} value={id}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="descriptionUrl"
            label="Description URL"
            rules={[{ message: 'Please enter valid URL', pattern: urlPattern }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </ModalForm>
      ) : null,
    [modalData],
  );

  return (
    <AdminPageLayout title="Manage Events" loading={loading} courses={courses}>
      <Content style={{ margin: 8 }}>
        <Button type="primary" onClick={handleAddItem}>
          Add Event
        </Button>
        <Table
          size="small"
          style={{ marginTop: 8 }}
          dataSource={data}
          pagination={{ pageSize: 100 }}
          rowKey="id"
          columns={getColumns(handleEditItem, handleDeleteItem) as ColumnsType<EventDto>}
        />
      </Content>
      {renderModal()}
    </AdminPageLayout>
  );
}

function createRecord(values: any) {
  const data: CreateEventDto = {
    name: values.name,
    description: values.description,
    descriptionUrl: values.descriptionUrl,
    type: values.type,
    disciplineId: values.disciplineId,
  };
  return data;
}

function getColumns(handleEditItem: any, handleDeleteItem: any) {
  return [
    {
      title: 'Id',
      dataIndex: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: stringSorter<EventDto>('name'),
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Discipline',
      dataIndex: ['discipline', 'name'],
    },
    {
      title: 'Description URL',
      dataIndex: 'descriptionUrl',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: stringTrimRenderer,
    },
    {
      title: 'Type',
      dataIndex: 'type',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      width: 100,
      render: (_: any, record: EventDto) => (
        <>
          <span>
            <a onClick={() => handleEditItem(record)}>Edit</a>{' '}
          </span>
          <span style={{ marginLeft: 8 }}>
            <CustomPopconfirm
              onConfirm={() => handleDeleteItem(record.id)}
              title="Are you sure you want to delete this item?"
            >
              <Typography.Link>Delete</Typography.Link>
            </CustomPopconfirm>
          </span>
        </>
      ),
    },
  ];
}

function getInitialValues(modalData: Partial<EventDto>) {
  return { ...modalData, disciplineId: modalData.discipline?.id };
}

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager]} anyCoursePowerUser>
        <Page />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
