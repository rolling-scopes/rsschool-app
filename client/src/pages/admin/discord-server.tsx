import { Button, Col, Form, Input, Layout, message, Row, Table, Popconfirm } from 'antd';
import { ModalForm } from 'components/Forms';
import { stringSorter } from 'components/Table';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { DiscordServersApi, UpdateDiscordServerDto, DiscordServerDto } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import { ActiveCourseProvider, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';

const { Content } = Layout;

enum ModalAction {
  update = 'update',
  create = 'create',
}

function Page() {
  const { courses } = useActiveCourseContext();
  const [data, setData] = useState<DiscordServerDto[]>([]);
  const [modalData, setModalData] = useState<Partial<DiscordServerDto> | null>(null);
  const [modalAction, setModalAction] = useState(ModalAction.update);
  const [modalLoading, setModalLoading] = useState(false);
  const discordServersService = new DiscordServersApi();

  const loadData = async () => {
    const { data } = await discordServersService.getDiscordServers();
    setData(data);
  };

  const { loading } = useAsync(loadData, []);

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
      await discordServersService.deleteDiscordServer(id);
      const { data } = await discordServersService.getDiscordServers();
      setData(data);
    } catch {
      message.error('Failed to delete discord server. Please try later.');
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
          await discordServersService.updateDiscordServer(modalData!.id!, values);
        } else {
          await discordServersService.createDiscordServer(values);
        }
        await loadData();
        setModalData(null);
      } catch (e) {
        message.error('An error occurred. Cannot save discord server.');
      } finally {
        setModalLoading(false);
      }
    },
    [modalAction, modalData, modalLoading],
  );

  const renderModal = useCallback(
    () => (
      <ModalForm
        data={modalData}
        title="Discord Server"
        submit={handleModalSubmit}
        cancel={() => setModalData(null)}
        getInitialValues={getInitialValues}
        loading={modalLoading}
      >
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter server name' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="gratitudeUrl"
              label="Gratitude URL"
              rules={[{ required: true, message: 'Please enter gratitude URL' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="mentorsChatUrl"
              label="Mentors chat URL"
              rules={[{ required: true, message: `Please enter mentors chat URL` }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </ModalForm>
    ),
    [modalData, handleModalSubmit],
  );

  return (
    <AdminPageLayout title="Manage Discord Servers" loading={loading} courses={courses}>
      <Content style={{ margin: 8 }}>
        <Button type="primary" onClick={handleAddItem}>
          Add Discord Server
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
      {renderModal()}
    </AdminPageLayout>
  );
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
      sorter: stringSorter<DiscordServerDto>('name'),
    },
    {
      title: 'Gratitude URL',
      dataIndex: 'gratitudeUrl',
      sorter: stringSorter<DiscordServerDto>('gratitudeUrl'),
    },
    {
      title: 'Mentors chat URL',
      dataIndex: 'mentorsChatUrl',
      sorter: stringSorter<DiscordServerDto>('mentorsChatUrl'),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_: any, record: DiscordServerDto) => (
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

function getInitialValues(modalData: Partial<DiscordServerDto>) {
  return modalData;
}

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider adminOnly>
        <Page />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
