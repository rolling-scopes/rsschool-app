import { useState, useCallback } from 'react';
import { Form, Button, Select, message, Popconfirm, Input, Table, Layout } from 'antd';

import { Header, Session, withSession, AdminSider } from 'components';
import { ModalForm } from 'components/Forms';
import { stringSorter, stringTrimRenderer } from 'components/Table';
import { Event, EventService } from 'services/event';
import { urlPattern } from 'services/validators';
import { useAsync } from 'react-use';
import { PRIMARY_SKILLS } from 'services/reference-data/primarySkills';
import { isAnyCourseManager } from '../../domain/user';

const { Content } = Layout;

type Props = { session: Session };
const service = new EventService();

const disciplines = PRIMARY_SKILLS;

function Page(props: Props) {
  const [data, setData] = useState([] as Event[]);
  const [modalData, setModalData] = useState(null as Partial<Event> | null);
  const [modalAction, setModalAction] = useState('update');

  const loadData = async () => {
    const data = await service.getEvents();
    setData(data);
  };

  useAsync(loadData, []);

  const handleAddItem = () => {
    setModalData({});
    setModalAction('create');
  };

  const handleEditItem = (record: Event) => {
    setModalData(record);
    setModalAction('update');
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await service.deleteEvent(id);
      const data = await service.getEvents();
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
          await service.updateEvent(modalData!.id!, record);
        } else {
          await service.createEvent(record);
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

  const renderModal = useCallback(() => {
    return (
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
            <Select.Option value="lecture_online">Online Lecture</Select.Option>
            <Select.Option value="lecture_offline">Offline Lecture</Select.Option>
            <Select.Option value="lecture_mixed">Online/Offline Lecture</Select.Option>
            <Select.Option value="lecture_self_study">Self-studying</Select.Option>
            <Select.Option value="warmup">Warm-up</Select.Option>
            <Select.Option value="info">Info (additional announcements)</Select.Option>
            <Select.Option value="workshop">Workshop</Select.Option>
            <Select.Option value="meetup">Meetup</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="discipline" label="Discipline">
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
    );
  }, [modalData]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={props.session.isAdmin} isCourseManager={isAnyCourseManager(props.session)} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Manage Events" username={props.session.githubId} />
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
            columns={getColumns(handleEditItem, handleDeleteItem)}
          />
        </Content>
      </Layout>
      {renderModal()}
    </Layout>
  );
}

function createRecord(values: any) {
  const data: Partial<Event> = {
    name: values.name,
    description: values.description,
    descriptionUrl: values.descriptionUrl,
    type: values.type,
    discipline: values.discipline,
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
      sorter: stringSorter<Event>('name'),
    },
    {
      title: 'Discipline',
      dataIndex: 'discipline',
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
      render: (_: any, record: Event) => (
        <>
          <span>
            <a onClick={() => handleEditItem(record)}>Edit</a>{' '}
          </span>
          <span style={{ marginLeft: 8 }}>
            <Popconfirm
              onConfirm={() => handleDeleteItem(record.id)}
              title="Are you sure you want to delete this item?"
            >
              <a href="#">Delete</a>
            </Popconfirm>
          </span>
        </>
      ),
    },
  ];
}

function getInitialValues(modalData: Partial<Event>) {
  return modalData;
}

export default withSession(Page);
