import { Layout, Button, Checkbox, Spin, Col, Form, Row, Table } from 'antd';
import { GithubUserLink, Header, withSession } from 'components';
import { ModalForm } from 'components/Forms';
import { boolIconRenderer } from 'components/Table';
import { UserSearch } from 'components/UserSearch';
import withCourseData from 'components/withCourseData';
import { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseUser } from 'services/course';
import { CoursePageProps } from 'services/models';
import { UserService } from 'services/user';

type Props = CoursePageProps;

function Page(props: Props) {
  const courseId = props.course.id;

  const [form] = Form.useForm();
  const userService = new UserService();
  const [loading, setLoading] = useState(false);
  const service = useMemo(() => new CourseService(courseId), [courseId]);
  const [data, setData] = useState([] as CourseUser[]);
  const [modalData, setModalData] = useState(null as Partial<CourseUser> | null);
  const [modalAction, setModalAction] = useState('update');

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await service.getUsers();
    setLoading(false);
    setData(data);
  }, [courseId]);

  useAsync(loadData, [courseId]);

  const handleAddItem = () => {
    setModalData({});
    setModalAction('create');
  };

  const handleEditItem = (record: CourseUser) => {
    setModalData(record);
    setModalAction('update');
  };

  const loadUsers = async (searchText: string) => userService.searchUser(searchText);

  const handleModalSubmit = async (values: any) => {
    const record = createRecord(values);
    modalAction === 'update'
      ? await service.updateUser(record.githubId, record)
      : await service.createUser(record.githubId, record);

    setModalData(null);
    loadData();
  };

  const renderModal = modalData => {
    return (
      <ModalForm
        form={form}
        getInitialValues={getInitialValues}
        data={modalData}
        title="Course User"
        submit={handleModalSubmit}
        cancel={() => setModalData(null)}
      >
        <Form.Item name="githubId" label="User" rules={[{ required: true, message: 'Please select an user' }]}>
          <UserSearch keyField="githubId" searchFn={loadUsers} />
        </Form.Item>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="isManager" valuePropName="checked">
              <Checkbox>Manager</Checkbox>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="isSupervisor" valuePropName="checked">
              <Checkbox>Supervisor</Checkbox>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="isJuryActivist" valuePropName="checked">
              <Checkbox>Jury Activist</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </ModalForm>
    );
  };

  return (
    <div>
      <Header username={props.session.githubId} />
      <Layout.Content style={{ margin: 8 }}>
        <Spin spinning={loading}>
          <Button type="primary" onClick={handleAddItem}>
            Add Task
          </Button>
          <Table
            rowKey="id"
            pagination={{ pageSize: 100 }}
            size="small"
            dataSource={data}
            columns={getColumns(handleEditItem)}
          />
        </Spin>
        {renderModal(modalData!)}
      </Layout.Content>
    </div>
  );
}

function getColumns(handleEditItem: any) {
  return [
    { title: 'User Id', dataIndex: 'id' },
    { title: 'Name', dataIndex: 'name' },
    {
      title: 'Github',
      dataIndex: 'githubId',
      render: (value: string) => <GithubUserLink value={value} />,
    },
    {
      title: 'Manager',
      dataIndex: 'isManager',
      render: boolIconRenderer,
    },
    {
      title: 'Supervisor',
      dataIndex: 'isSupervisor',
      render: boolIconRenderer,
    },
    {
      title: 'Jury Activist',
      dataIndex: 'isJuryActivist',
      render: boolIconRenderer,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record: CourseUser) => (
        <>
          <a onClick={() => handleEditItem(record)}>Edit</a>{' '}
        </>
      ),
    },
  ];
}

function createRecord(values: any) {
  const data = {
    githubId: values.githubId,
    isManager: values.isManager,
    isJuryActivist: values.isJuryActivist,
    isSupervisor: values.isSupervisor,
  };
  return data;
}

function getInitialValues(modalData: Partial<CourseUser>) {
  return modalData;
}

export default withCourseData(withSession(Page));
