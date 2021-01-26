import { Button, Checkbox, Col, DatePicker, Form, Input, Layout, message, Radio, Row, Select, Table } from 'antd';
import { AdminSider, Header, Session, withSession } from 'components';
import { ModalForm } from 'components/Forms';
import { dateRenderer, stringSorter, stringTrimRenderer, boolIconRenderer } from 'components/Table';
import moment from 'moment';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { CoursesService } from 'services/courses';
import { DiscordServerService } from 'services/discordServer';
import { Course, DiscordServer } from 'services/models';
import { PRIMARY_SKILLS } from 'services/reference-data';

const { Content } = Layout;
type Props = { session: Session };

function Page(props: Props) {
  const [courses, setCourses] = useState([] as Course[]);
  const [discordServers, setDiscordServers] = useState([] as DiscordServer[]);
  const [modalData, setModalData] = useState(null as Partial<Course> | null);
  const [modalAction, setModalAction] = useState('update');
  const [modalLoading, setModalLoading] = useState(false);
  const [isCopy, setIsCopy] = useState(false);
  const courseService = new CoursesService();
  const discordServerService = new DiscordServerService();

  const loadData = async () => {
    const [courses, discordServers] = await Promise.all([
      courseService.getCourses(),
      discordServerService.getDiscordServers(),
    ]);
    setCourses(courses);
    setDiscordServers(discordServers);
  };

  useAsync(loadData, []);

  const handleAddItem = () => {
    setModalData({});
    setModalAction('create');
  };

  const handleEditItem = (record: Course) => {
    setModalData(record);
    setModalAction('update');
  };

  const handleModalSubmit = useCallback(
    async (values: any) => {
      try {
        if (modalLoading) {
          return;
        }
        setModalLoading(true);
        const record = createRecord(values);
        if (modalAction === 'update') {
          await courseService.updateCourse(modalData!.id!, record);
        } else {
          if (values.courseId) {
            await courseService.createCourseCopy(record, values.courseId);
            setIsCopy(false);
          } else {
            await courseService.createCourse(record);
          }
        }
        await loadData();
        setModalData(null);
      } catch (e) {
        message.error('An error occurred. Can not save the task.');
      } finally {
        setModalLoading(false);
      }
    },
    [modalAction, modalData, modalLoading],
  );

  const renderModal = useCallback(() => {
    const isUpdate = modalAction === 'update';
    return (
      <ModalForm
        data={modalData}
        title="Course"
        submit={handleModalSubmit}
        cancel={() => setModalData(null)}
        getInitialValues={getInitialValues}
        loading={modalLoading}
      >
        <Row gutter={24}>
          <Col span={24}>
            {!isUpdate ? (
              <Checkbox checked={isCopy} value={isCopy} onChange={e => setIsCopy(e.target.checked)}>
                I want to copy stages and events from other course
              </Checkbox>
            ) : (
              ''
            )}
            {isCopy && !isUpdate ? (
              <Form.Item name="courseId" label="Choose course">
                <Select placeholder="Please select course template">
                  {courses.map(course => (
                    <Select.Option key={course.id} value={course.id}>
                      {course.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            ) : (
              ''
            )}
          </Col>
          <Col span={12}>
            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter full name' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="alias" label="Alias" rules={[{ required: true, message: 'Please enter alias' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="certificateIssuer" label="Certificate Issuer">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please course description' }]}
            >
              <Input.TextArea />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="discordServerId"
              label="Choose discord server"
              rules={[{ required: true, message: 'Please select discord server' }]}
            >
              <Select placeholder="Please select discord server">
                {discordServers.map(discordServer => (
                  <Select.Option key={discordServer.id} value={discordServer.id}>
                    {discordServer.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="primarySkillId"
          label="Primary Skill"
          rules={[{ required: true, message: 'Please select a primary skill' }]}
        >
          <Select placeholder="Please select a primary skill">
            {PRIMARY_SKILLS.map(skill => (
              <Select.Option key={skill.id} value={skill.id}>
                {skill.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="range"
          label="Start Date - End Date"
          rules={[{ required: true, type: 'array', message: 'Please enter course date range' }]}
        >
          <DatePicker.RangePicker />
        </Form.Item>

        <Form.Item name="registrationEndDate" label="Registration End Date">
          <DatePicker />
        </Form.Item>

        <Form.Item name="state" label="State">
          <Radio.Group>
            <Radio value={null}>Active</Radio>
            <Radio value="planned">Planned</Radio>
            <Radio value="completed">Completed</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="inviteOnly" label="Invite Only" valuePropName="checked">
          <Checkbox>Invite Only Course</Checkbox>
        </Form.Item>
      </ModalForm>
    );
  }, [modalData, handleModalSubmit, isCopy, setIsCopy]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={props.session.isAdmin} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Manage Courses" username={props.session.githubId} />
        <Content style={{ margin: 8 }}>
          <Button type="primary" onClick={handleAddItem}>
            Add Course
          </Button>
          <Table
            size="small"
            style={{ marginTop: 8 }}
            dataSource={courses}
            pagination={{ pageSize: 100 }}
            rowKey="id"
            columns={getColumns(handleEditItem)}
          />
        </Content>
      </Layout>
      {renderModal()}
    </Layout>
  );
}

function createRecord(values: any) {
  const [startDate, endDate] = values.range || [null, null];
  const record: Partial<Course> = {
    name: values.name,
    fullName: values.fullName,
    alias: values.alias,
    startDate: startDate ? startDate.toISOString() : null,
    endDate: endDate ? endDate.toISOString() : null,
    registrationEndDate: values.registrationEndDate ? values.registrationEndDate.toISOString() : null,
    completed: values.state === 'completed',
    planned: values.state === 'planned',
    inviteOnly: values.inviteOnly,
    description: values.description,
    primarySkillId: values.primarySkillId,
    primarySkillName: (PRIMARY_SKILLS.find(skill => skill.id === values.primarySkillId) || { name: '' }).name,
    certificateIssuer: values.certificateIssuer,
    discordServerId: values.discordServerId,
  };
  return record;
}

function getColumns(handleEditItem: any) {
  return [
    {
      title: 'Id',
      dataIndex: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: stringSorter<Course>('name'),
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      sorter: stringSorter<Course>('fullName'),
      width: 200,
    },
    {
      title: 'Alias',
      dataIndex: 'alias',
      sorter: stringSorter<Course>('alias'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: stringTrimRenderer,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      render: dateRenderer,
      width: 120,
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      render: dateRenderer,
    },
    {
      title: 'Primary Skill',
      dataIndex: 'primarySkillName',
    },
    {
      title: 'Completed',
      dataIndex: 'completed',
      render: boolIconRenderer,
    },
    {
      title: 'Planned',
      dataIndex: 'planned',
      render: boolIconRenderer,
    },
    {
      title: 'Invite Only',
      dataIndex: 'inviteOnly',
      render: boolIconRenderer,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_: any, record: any) => <a onClick={() => handleEditItem(record)}>Edit</a>,
    },
  ];
}

function getInitialValues(modalData: Partial<Course>) {
  return {
    ...modalData,
    inviteOnly: !!modalData.inviteOnly,
    state: modalData.completed ? 'completed' : modalData.planned ? 'planned' : null,
    registrationEndDate: modalData.registrationEndDate ? moment(modalData.registrationEndDate) : null,
    range:
      modalData.startDate && modalData.endDate
        ? [
            modalData.startDate ? moment(modalData.startDate) : null,
            modalData.endDate ? moment(modalData.endDate) : null,
          ]
        : null,
  };
}

export default withSession(Page);
