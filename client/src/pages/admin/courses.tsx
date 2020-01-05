import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Layout,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Table,
} from 'antd';
import { AdminSider, Header, Session, withSession } from 'components';
import { boolRenderer, dateRenderer, stringSorter, stringTrimRenderer } from 'components/Table';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { CoursesService } from 'services/courses';
import { Course } from 'services/models';
import { PRIMARY_SKILLS } from 'services/reference-data';
import { FormInstance } from 'antd/lib/form';

const { Content } = Layout;

type Props = { session: Session };

function CoursesPage(props: Props) {
  const [data, setData] = useState([] as Course[]);
  const [modalData, setModalData] = useState(null as Partial<Course> | null);
  const [modalAction, setModalAction] = useState('update');
  const [form] = Form.useForm();
  const courseService = new CoursesService();

  useEffect(() => {
    courseService.getCourses().then(setData);
  }, []);

  const handleAddItem = () => {
    setModalData({});
    setModalAction('create');
  };

  const handleEditItem = (record: Course) => {
    setModalData(record);
    setModalAction('update');
  };

  const renderModal = (form: FormInstance, modalData: Partial<Course> | null, setModalData) => {
    if (modalData == null) {
      return null;
    }
    return (
      <Modal
        style={{ top: 20 }}
        visible={!!modalData}
        title="Course"
        okText="Save"
        onOk={handleModalSubmit(form)}
        onCancel={() => setModalData(null)}
      >
        <Form form={form} initialValues={getInitialValues(modalData)} layout="vertical">
          <Row gutter={24}>
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
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please course description' }]}
              >
                <Input.TextArea />
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
        </Form>
      </Modal>
    );
  };

  const handleModalSubmit = (form: FormInstance) => async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const values = await form.validateFields().catch(() => null);
      if (values == null) {
        return;
      }

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
      };

      const course =
        modalAction === 'update'
          ? await courseService.updateCourse(modalData!.id!, record)
          : await courseService.createCourse(record);
      const updatedData =
        modalAction === 'update'
          ? data.map(d => (d.id === course.id ? { ...d, ...course } : d))
          : data.concat([course]);
      setModalData(null);
      setData(updatedData);
    } catch (e) {
      message.error('An error occurred. Can not save the task.');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider />
      <Layout style={{ background: '#fff' }}>
        <Header title="Manage Courses" username={props.session.githubId} />
        <Content style={{ margin: 8 }}>
          <Button type="primary" onClick={handleAddItem}>
            Add Course
          </Button>

          <Table
            size="small"
            style={{ marginTop: 8 }}
            dataSource={data}
            pagination={{ pageSize: 100 }}
            rowKey="id"
            columns={[
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
                render: boolRenderer,
              },
              {
                title: 'Planned',
                dataIndex: 'planned',
                render: boolRenderer,
              },
              {
                title: 'Invite Only',
                dataIndex: 'inviteOnly',
                render: boolRenderer,
              },
              {
                title: 'Actions',
                dataIndex: 'actions',
                render: (_, record) => <a onClick={() => handleEditItem(record)}>Edit</a>,
              },
            ]}
          />
        </Content>
      </Layout>
      {renderModal(form, modalData, setModalData)}
    </Layout>
  );
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

export default withSession(CoursesPage);
