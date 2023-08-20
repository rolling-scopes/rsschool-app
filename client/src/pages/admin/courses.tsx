import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  Layout,
  message,
  Radio,
  Row,
  Select,
  Table,
} from 'antd';
import withSession, { Session } from 'components/withSession';
import { ModalForm } from 'components/Forms';
import { dateUtcRenderer, stringSorter, stringTrimRenderer, boolIconRenderer } from 'components/Table';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { CoursesService } from 'services/courses';
import { DiscordServersApi, DiscordServerDto, DisciplinesApi, DisciplineDto, CoursesApi, UpdateCourseDto } from 'api';
import { Course, CourseRole } from 'services/models';
import { DEFAULT_COURSE_ICONS } from 'configs/course-icons';
import { AdminPageLayout } from 'components/PageLayout';
import { getCoursesProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import { isCourseManager } from 'domain/user';
import utc from 'dayjs/plugin/utc';
import { SessionAndCourseProvider } from 'modules/Course/contexts';
dayjs.extend(utc);

const { Content } = Layout;
type Props = { session: Session; courses: Course[] };

const disciplinesApi = new DisciplinesApi();
const courseService = new CoursesService();
const discordServersService = new DiscordServersApi();
const courseApi = new CoursesApi();

function filterCourses(session: Session, courses: Course[]) {
  return courses.filter(course => isCourseManager(session, course.id));
}

function Page(props: Props) {
  const [courses, setCourses] = useState<Course[]>(filterCourses(props.session, props.courses));
  const [discordServers, setDiscordServers] = useState<DiscordServerDto[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [modalData, setModalData] = useState(null as Partial<Course> | null);
  const [modalAction, setModalAction] = useState('update');
  const [modalLoading, setModalLoading] = useState(false);
  const [isCopy, setIsCopy] = useState(false);

  const loadData = async () => {
    const [{ data: courses }, { data: discordServers }, { data: disciplines }] = await Promise.all([
      courseApi.getCourses(),
      discordServersService.getDiscordServers(),
      disciplinesApi.getDisciplines(),
    ]);
    setCourses(filterCourses(props.session, courses));
    setDiscordServers(discordServers);
    setDisciplines(disciplines);
  };

  const { loading } = useAsync(loadData, []);

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
          await courseApi.updateCourse(modalData!.id!, record);
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
          name={['discipline', 'id']}
          label="Disciplines"
          rules={[{ required: true, message: 'Please select a discipline' }]}
        >
          <Select placeholder="Please select a discipline">
            {disciplines.map(discipline => (
              <Select.Option key={discipline.id} value={discipline.id}>
                {discipline.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Row justify="space-between">
          <Col>
            <Form.Item
              name="range"
              label="Start Date - End Date"
              rules={[{ required: true, type: 'array', message: 'Please enter course date range' }]}
            >
              <DatePicker.RangePicker />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="registrationEndDate" label="Registration End Date">
              <DatePicker />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="logo" label="Course Logo">
          <Select placeholder="Please select logo">
            {courseIcons.map(course => (
              <Select.Option key={course.id} value={course.id}>
                {course.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="state" label="State">
          <Radio.Group>
            <Radio value={null}>Active</Radio>
            <Radio value="planned">Planned</Radio>
            <Radio value="completed">Completed</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="usePrivateRepositories" label="Repositories" valuePropName="checked">
          <Checkbox>Use Private Repositories</Checkbox>
        </Form.Item>

        <Form.Item name="personalMentoring" label="Personal Mentoring" valuePropName="checked">
          <Checkbox>Personal mentoring</Checkbox>
        </Form.Item>

        <Form.Item name="inviteOnly" label="Invite Only" valuePropName="checked">
          <Checkbox>Invite Only Course</Checkbox>
        </Form.Item>
      </ModalForm>
    );
  }, [modalData, handleModalSubmit, isCopy, setIsCopy]);

  return (
    <AdminPageLayout title="Manage Courses" loading={loading} courses={courses}>
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
      {renderModal()}
    </AdminPageLayout>
  );
}

function createRecord(values: any) {
  const [startDate, endDate] = values.range as [dayjs.Dayjs, dayjs.Dayjs];
  const record: UpdateCourseDto = {
    name: values.name,
    fullName: values.fullName,
    alias: values.alias,
    startDate: startDate ? dayjs.utc(startDate).startOf('day').format() : undefined,
    endDate: endDate ? dayjs.utc(endDate).startOf('day').format() : undefined,
    registrationEndDate: values.registrationEndDate ? values.registrationEndDate.toISOString() : null,
    completed: values.state === 'completed',
    planned: values.state === 'planned',
    inviteOnly: values.inviteOnly,
    description: values.description,
    disciplineId: values.discipline?.id,
    certificateIssuer: values.certificateIssuer,
    discordServerId: values.discordServerId,
    usePrivateRepositories: values.usePrivateRepositories,
    personalMentoring: values.personalMentoring,
    logo: values.logo,
  };
  return record;
}

const courseIcons = Object.entries(DEFAULT_COURSE_ICONS).map(([key, config]) => ({ ...config, id: key }));

function getColumns(handleEditItem: any) {
  return [
    {
      title: 'Id',
      dataIndex: 'id',
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      render: (logo: string) => <Image width={25} preview={false} src={DEFAULT_COURSE_ICONS[logo]?.active} />,
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
      render: dateUtcRenderer,
      width: 120,
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      render: dateUtcRenderer,
    },
    {
      title: 'Discipline',
      dataIndex: ['discipline', 'name'],
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
    registrationEndDate: modalData.registrationEndDate ? dayjs.utc(modalData.registrationEndDate) : null,
    range:
      modalData.startDate && modalData.endDate
        ? [
            modalData.startDate ? dayjs.utc(modalData.startDate) : null,
            modalData.endDate ? dayjs.utc(modalData.endDate) : null,
          ]
        : null,
  };
}

export { getServerSideProps };

function PageWithContext(props: Props) {
  return (
    <SessionAndCourseProvider>
      <Page {...props} />
    </SessionAndCourseProvider>
  );
}

export default withSession(PageWithContext, { requiredAnyCourseRole: CourseRole.Manager });
