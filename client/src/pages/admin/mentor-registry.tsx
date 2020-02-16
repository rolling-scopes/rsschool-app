import { Col, Layout, Select, Spin, Table, Form, message } from 'antd';
import { AdminSider, GithubUserLink, Header } from 'components';
import { stringSorter, boolIconRenderer, tagsRenderer, getColumnSearchProps, dateRenderer } from 'components/Table';
import withSession, { Session } from 'components/withSession';
import { useState, useCallback } from 'react';
import { useAsync } from 'react-use';
import { MentorRegistry, MentorRegistryService } from 'services/mentorRegistry';
import { Course } from 'services/models';
import { CoursesService } from 'services/courses';
import { ModalForm } from 'components/Forms';

const { Content } = Layout;
const PAGINATION = 200;

type Props = { courses: Course[]; session: Session };
const mentorRegistryService = new MentorRegistryService();
const coursesService = new CoursesService();

function Page(props: Props) {
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [data, setData] = useState([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modalData, setModalData] = useState(null as Partial<any> | null);

  const loadData = useCallback(async () => {
    setLoading(true);

    const data = await mentorRegistryService.getMentors();
    const courses = await coursesService.getCourses();

    setData(data);
    setCourses(courses);
    setLoading(false);
  }, []);

  useAsync(loadData, []);

  const handleModalSubmit = useCallback(
    async (values: any) => {
      try {
        setModalLoading(true);
        await mentorRegistryService.updateMentor(modalData!.id!, values);
        setModalData(null);
        loadData();
      } catch (e) {
        message.error('An error occurred. Please try again later.');
      } finally {
        setModalLoading(false);
      }
    },
    [modalData],
  );

  const renderModal = useCallback(() => {
    return (
      <ModalForm
        data={modalData}
        title="Task"
        submit={handleModalSubmit}
        cancel={() => setModalData(null)}
        getInitialValues={getInitialValues}
        loading={modalLoading}
      >
        <Form.Item name="preselectedCourses" label="Pre-Selected Courses">
          <Select mode="multiple">
            {courses.map(course => (
              <Select.Option disabled={course.completed} key={course.id} value={course.id}>
                {course.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </ModalForm>
    );
  }, [modalData]);

  function getInitialValues(modalData: Partial<any>) {
    return {
      preselectedCourses: modalData.preselectedCourses?.map((v: string) => Number(v)),
    };
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={props.session.isAdmin} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Mentor Registry" username={props.session.githubId} />
        <Content style={{ margin: 8 }}>
          <Spin spinning={loading}>
            <Col>
              <Table<MentorRegistry>
                bordered
                pagination={{ pageSize: PAGINATION }}
                size="small"
                rowKey="githubId"
                dataSource={data}
                columns={[
                  {
                    title: 'Name',
                    dataIndex: 'name',
                    width: 130,
                    sorter: stringSorter('name'),
                    ...getColumnSearchProps('name'),
                  },
                  {
                    title: 'Github',
                    dataIndex: 'githubId',
                    width: 110,
                    sorter: stringSorter('githubId'),
                    render: (value: string) => <GithubUserLink value={value} />,
                    ...getColumnSearchProps('githubId'),
                  },
                  {
                    title: 'City',
                    dataIndex: 'locationName',
                    width: 80,
                  },
                  {
                    title: 'Updated',
                    dataIndex: 'updatedDate',
                    render: dateRenderer,
                  },
                  {
                    title: 'Prefered',
                    dataIndex: 'preferedCourses',
                    render: (values: string[]) =>
                      tagsRenderer(values.map(v => courses.find(c => c.id.toString() === v)?.name ?? v)),
                  },
                  {
                    title: 'Pre-Selected',
                    dataIndex: 'preselectedCourses',
                    render: (values: string[]) =>
                      tagsRenderer(values.map(v => courses.find(c => c.id.toString() === v)?.name ?? v)),
                  },
                  {
                    title: 'Max students',
                    dataIndex: 'maxStudentsLimit',
                    width: 80,
                  },
                  {
                    title: 'Students Location',
                    dataIndex: 'preferedStudentsLocation',
                    width: 120,
                    sorter: stringSorter('githubId'),
                  },
                  {
                    title: 'English',
                    dataIndex: 'englishMentoring',
                    render: boolIconRenderer,
                    width: 40,
                  },
                  {
                    title: 'Technical Mentoring',
                    dataIndex: 'technicalMentoring',
                    render: tagsRenderer,
                  },
                  {
                    title: 'Comment',
                    dataIndex: 'comment',
                    width: 150,
                  },
                  {
                    title: 'Actions',
                    dataIndex: 'actions',
                    render: (_: any, record: any) => <a onClick={() => setModalData(record)}>Edit</a>,
                  },
                ]}
              />
            </Col>
          </Spin>
        </Content>
        {renderModal()}
      </Layout>
    </Layout>
  );
}

export default withSession(Page);
