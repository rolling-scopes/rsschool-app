import { Form, Button, DatePicker, Input, Layout, message, Modal, Select, Table } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { AdminSider, Header } from 'components';
import { dateRenderer, idFromArrayRenderer, stringSorter } from 'components/Table';
import withSession, { Session } from 'components/withSession';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { CoursesService } from 'services/courses';
import { formatDate } from 'services/formatter';
import { Course } from 'services/models';
import { Stage, StageService } from 'services/stage';

const { Content } = Layout;
type Props = { session: Session };

function StagesPage(props: Props) {
  const [data, setData] = useState([] as Stage[]);
  const [courses, setCourses] = useState([] as Course[]);
  const [modalData, setModalData] = useState(null as Partial<Stage> | null);
  const [modalAction, setModalAction] = useState('update');
  const [form] = Form.useForm();
  const stageService = new StageService();

  useEffect(() => {
    Promise.all([stageService.getStages(), new CoursesService().getCourses()]).then(([stages, courses]) => {
      setData(stages);
      setCourses(courses);
    });
  }, []);

  const handleAddItem = () => {
    setModalData({});
    setModalAction('create');
  };

  const handleEditItem = (record: Stage) => {
    setModalData(record);
    setModalAction('update');
  };

  const renderModal = (form: FormInstance, modalData: Partial<Stage> | null, setModalData) => {
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
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter stage name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="courseId" label="Course" rules={[{ required: true, message: 'Please select a course' }]}>
            <Select placeholder="Please select a course">
              {courses.map((course: Course) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="range"
            label="Start Date - End Date"
            rules={[{ required: true, type: 'array', message: 'Please enter course start and end date' }]}
          >
            <DatePicker.RangePicker />
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

      const record: Partial<Stage> = {
        name: values.name,
        startDate: startDate ? formatDate(startDate) : null,
        endDate: endDate ? formatDate(endDate) : null,
        courseId: values.courseId,
      };

      const course =
        modalAction === 'update'
          ? await stageService.updateStage(modalData!.id!, record)
          : await stageService.createStage(record);
      const updatedData =
        modalAction === 'update'
          ? data.map(d => (d.id === course.id ? { ...d, ...course } : d))
          : data.concat([course]);
      setModalData(null);
      setData(updatedData);
    } catch (e) {
      message.error('An error occurred. Please try again later.');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider />
      <Layout style={{ background: '#fff' }}>
        <Header title="Manage Stages" username={props.session.githubId} />
        <Content style={{ margin: 8 }}>
          <Button type="primary" onClick={handleAddItem}>
            Add Stage
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
                sorter: stringSorter<Stage>('name'),
              },
              {
                title: 'Course',
                dataIndex: 'courseId',
                render: idFromArrayRenderer(courses),
                sorter: stringSorter<Stage>('courseId'),
              },
              {
                title: 'Start Date',
                dataIndex: 'startDate',
                render: dateRenderer,
              },
              {
                title: 'End Date',
                dataIndex: 'endDate',
                render: dateRenderer,
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

function getInitialValues(modalData: Partial<Stage>) {
  return {
    ...modalData,
    range:
      modalData.startDate && modalData.endDate
        ? [
            modalData.startDate ? moment(modalData.startDate) : null,
            modalData.endDate ? moment(modalData.endDate) : null,
          ]
        : null,
  };
}

export default withSession(StagesPage);
