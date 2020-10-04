import { Button, DatePicker, Form, Input, Layout, message, Select, Table, Alert } from 'antd';
import { AdminSider, Header } from 'components';
import { ModalForm } from 'components/Forms';
import { dateRenderer, idFromArrayRenderer, stringSorter } from 'components/Table';
import withSession, { Session } from 'components/withSession';
import moment from 'moment';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { CoursesService } from 'services/courses';
import { formatDate } from 'services/formatter';
import { Course } from 'services/models';
import { Stage, StageService } from 'services/stage';

const { Content } = Layout;
type Props = { session: Session };

function Page(props: Props) {
  const [data, setData] = useState([] as Stage[]);
  const [courses, setCourses] = useState([] as Course[]);
  const [modalData, setModalData] = useState(null as Partial<Stage> | null);
  const [modalAction, setModalAction] = useState('update');
  const service = new StageService();

  useAsync(async () => {
    const [stages, courses] = await Promise.all([service.getStages(), new CoursesService().getCourses()]);
    setData(stages);
    setCourses(courses);
  }, []);

  const handleAddItem = () => {
    setModalData({});
    setModalAction('create');
  };

  const handleEditItem = (record: Stage) => {
    setModalData(record);
    setModalAction('update');
  };

  const handleModalSubmit = useCallback(
    async (values: any) => {
      try {
        const record = createRecord(values);
        const item =
          modalAction === 'update'
            ? await service.updateStage(modalData!.id!, record)
            : await service.createStage(record);
        const updatedData =
          modalAction === 'update' ? data.map((d) => (d.id === item.id ? { ...d, ...item } : d)) : data.concat([item]);
        setModalData(null);
        setData(updatedData);
      } catch (e) {
        message.error('An error occurred. Please try again later.');
      }
    },
    [modalData, modalAction],
  );

  const renderModal = useCallback(() => {
    return (
      <ModalForm
        data={modalData}
        title="Stage"
        submit={handleModalSubmit}
        cancel={() => setModalData(null)}
        getInitialValues={getInitialValues}
      >
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
      </ModalForm>
    );
  }, [modalData, handleModalSubmit]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={props.session.isAdmin} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Manage Stages" username={props.session.githubId} />
        <Content style={{ margin: 8 }}>
          <Alert style={{ marginBottom: 16 }} message="Stages are deprecated" type="error" />
          <Button type="primary" onClick={handleAddItem}>
            Add Stage
          </Button>

          <Table
            size="small"
            style={{ marginTop: 8 }}
            dataSource={data}
            pagination={{ pageSize: 100 }}
            rowKey="id"
            columns={getColumns(handleEditItem, courses)}
          />
        </Content>
      </Layout>
      {renderModal()}
    </Layout>
  );
}

function createRecord(values: any) {
  const [startDate, endDate] = values.range || [null, null];

  const record: Partial<Stage> = {
    name: values.name,
    startDate: startDate ? formatDate(startDate) : null,
    endDate: endDate ? formatDate(endDate) : null,
    courseId: values.courseId,
  };
  return record;
}

function getColumns(handleEditItem: any, courses: any) {
  return [
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
      render: (_: any, record: Stage) => <a onClick={() => handleEditItem(record)}>Edit</a>,
    },
  ];
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

export default withSession(Page);
