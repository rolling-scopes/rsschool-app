import { Button, Col, Form, Input, Layout, message, Row, Table, Popconfirm } from 'antd';
import { AdminSider, Header, Session, withSession } from 'components';
import { ModalForm } from 'components/Forms';
import { stringSorter } from 'components/Table';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { DiscordServerService } from 'services/discordServer';
import { DiscordServer } from 'services/models';

const { Content } = Layout;
type Props = { session: Session };

enum ModalAction {
  update = 'update',
  create = 'create',
}

function Page(props: Props) {
  const [data, setData] = useState([] as DiscordServer[]);
  const [modalData, setModalData] = useState(null as Partial<DiscordServer> | null);
  const [modalAction, setModalAction] = useState(ModalAction.update);
  const [modalLoading, setModalLoading] = useState(false);
  const discordServerService = new DiscordServerService();

  const loadData = async () => {
    const data = await discordServerService.getDiscordServers();
    setData(data);
  };

  useAsync(loadData, []);

  const handleAddItem = () => {
    setModalData({});
    setModalAction(ModalAction.create);
  };

  const handleEditItem = (record: DiscordServer) => {
    setModalData(record);
    setModalAction(ModalAction.update);
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await discordServerService.deleteDiscordServer(id);
      const data = await discordServerService.getDiscordServers();
      setData(data);
    } catch {
      message.error('Failed to delete discord server. Please try later.');
    }
  };

  const handleModalSubmit = useCallback(
    async (values: any) => {
      try {
        if (modalLoading) {
          return;
        }
        setModalLoading(true);
        const record = createRecord(values);
        if (modalAction === ModalAction.update) {
          await discordServerService.updateDiscordServer(modalData!.id!, record);
        } else {
          await discordServerService.createDiscordServer(record);
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
        </Row>
      </ModalForm>
    ),
    [modalData, handleModalSubmit],
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={props.session.isAdmin} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Manage Discord Servers" username={props.session.githubId} />
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
      </Layout>
      {renderModal()}
    </Layout>
  );
}

function createRecord(values: any) {
  const record: Partial<DiscordServer> = {
    name: values.name,
    gratitudeUrl: values.gratitudeUrl,
  };
  return record;
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
      sorter: stringSorter<DiscordServer>('name'),
    },
    {
      title: 'Gratitude URL',
      dataIndex: 'gratitudeUrl',
      sorter: stringSorter<DiscordServer>('gratitudeUrl'),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_: any, record: DiscordServer) => (
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

function getInitialValues(modalData: Partial<DiscordServer>) {
  return modalData;
}

export default withSession(Page);
