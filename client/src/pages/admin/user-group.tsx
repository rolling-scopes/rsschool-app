import { Button, Col, Form, Input, Layout, message, Popconfirm, Row, Select, Table, Tag } from 'antd';
import { AdminSider } from 'components/AdminSider';
import { ModalForm } from 'components/Forms';
import { GithubAvatar } from 'components/GithubAvatar';
import { Header } from 'components/Header';
import { stringSorter } from 'components/Table';
import { UserSearch } from 'components/UserSearch';
import { Session, withSession } from 'components/withSession';
import React, { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { UserGroup } from 'services/models';
import { UserService } from 'services/user';
import { UserGroupService } from 'services/userGroup';


const { Content } = Layout;
type Props = { session: Session };

enum ModalAction {
  update = 'update',
  create = 'create',
}

const roles = ['juryActivist', 'manager', 'supervisor'];
const rolesColors: Record<string, string> = {
  supervisor: 'purple',
  manager: 'volcano',
  juryActivist: 'gold',
};

function Page(props: Props) {
  const [data, setData] = useState([] as UserGroup[]);
  const [modalData, setModalData] = useState(null as Partial<UserGroup> | null);
  const [modalAction, setModalAction] = useState(ModalAction.update);
  const [modalLoading, setModalLoading] = useState(false);

  const userService = new UserService();
  const userGroupService = new UserGroupService();

  const loadData = async () => {
    const data = await userGroupService.getUserGroups();
    setData(data);
  };

  useAsync(loadData, []);

  const loadUsers = async (searchText: string) => {
    return userService.searchUser(searchText);
  };

  const handleAddItem = () => {
    setModalData({});
    setModalAction(ModalAction.create);
  };

  const handleEditItem = (record: UserGroup) => {
    setModalData(record);
    setModalAction(ModalAction.update);
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await userGroupService.deleteUserGroup(id);
      const data = await userGroupService.getUserGroups();
      setData(data);
    } catch {
      message.error('Failed to delete user group. Please try later.');
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
          await userGroupService.updateUserGroup(modalData!.id!, record);
        } else {
          await userGroupService.createUserGroup(record);
        }
        await loadData();
        setModalData(null);
      } catch (e) {
        message.error('An error occurred. Cannot save user group.');
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
        title="User Group"
        submit={handleModalSubmit}
        cancel={() => setModalData(null)}
        getInitialValues={getInitialValues}
        loading={modalLoading}
      >
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter user group name' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="users" label="Users" rules={[{ required: true, message: 'Please select users' }]}>
              <UserSearch mode="multiple" searchFn={loadUsers} defaultValues={modalData?.users} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="roles" label="Roles" rules={[{ required: true, message: `Please select permissions` }]}>
              <Select mode="tags">
                {roles.map(role => (
                  <Select.Option key={role} value={role}>
                    {role}
                  </Select.Option>
                ))}
              </Select>
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
        <Header title="Manage User Groups" username={props.session.githubId} />
        <Content style={{ margin: 8 }}>
          <Button type="primary" onClick={handleAddItem}>
            Add User Group
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
  const record: Partial<UserGroup> = {
    name: values.name,
    users: values.users,
    roles: values.roles,
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
      sorter: stringSorter<UserGroup>('name'),
    },
    {
      title: 'Users',
      dataIndex: 'users',
      render: (_: any, record: UserGroup) => (
        <div>
          {record.users.map((user, index, array) => (
            <div key={user.id} style={{ display: 'flex', marginBottom: index < array.length - 1 ? 10 : 0 }}>
              <GithubAvatar size={24} githubId={user.githubId} />
              &nbsp;{user.name} ({user.githubId})
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      render: (_: any, record: UserGroup) => (
        <div>
          {record.roles.map(role => (
            <Tag color={rolesColors[role]} key={role}>
              {role}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_: any, record: UserGroup) => (
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

function getInitialValues(modalData: Partial<UserGroup>) {
  return {
    ...modalData,
    users: modalData.users?.map(user => user.id) ?? [],
  };
}

export default withSession(Page);
