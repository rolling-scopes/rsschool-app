import { Col, Row, Layout, Select, Spin, Table, Form, message, Checkbox, Button } from 'antd';
import { AdminSider, GithubUserLink, Header } from 'components';
import {
  stringSorter,
  boolIconRenderer,
  tagsRenderer,
  colorTagRenderer,
  getColumnSearchProps,
  dateRenderer,
} from 'components/Table';
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
  const [showAll, setShowAll] = useState(false);

  const [data, setData] = useState<any[]>([]);
  const [allData, setAllData] = useState<any[]>([]);

  const [courses, setCourses] = useState<Course[]>([]);
  const [modalData, setModalData] = useState(null as Partial<any> | null);

  const loadData = useCallback(async () => {
    setLoading(true);

    const data = await mentorRegistryService.getMentors();
    const courses = await coursesService.getCourses();

    setAllData(data);
    setData(filterData(data, showAll));

    setCourses(courses);
    setLoading(false);
  }, [showAll]);

  useAsync(loadData, []);

  const handleModalSubmit = useCallback(
    async (values: any) => {
      try {
        setModalLoading(true);
        await mentorRegistryService.updateMentor(modalData!.githubId, values);
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
              <Row justify="space-between">
                <Form.Item>
                  <Checkbox
                    onChange={e => {
                      const value = e.target.checked;
                      setShowAll(value);
                      setData(filterData(allData, value));
                    }}
                  >
                    Show All
                  </Checkbox>
                </Form.Item>
                <Button onClick={() => (window.location.href = `/api/registry/mentors/csv`)}>Export CSV</Button>
              </Row>
            </Col>
            <Col style={{ marginBottom: 8 }}> Total mentors: {data.length} </Col>
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
                    sorter: stringSorter('locationName'),
                    ...getColumnSearchProps('locationName'),
                  },
                  {
                    title: 'Updated',
                    dataIndex: 'updatedDate',
                    render: dateRenderer,
                  },
                  {
                    title: 'Preferred',
                    dataIndex: 'preferedCourses',
                    render: (values: number[]) =>
                      tagsRenderer(values.map(v => courses.find(c => c.id === v)?.name ?? v)),
                  },
                  {
                    title: 'Pre-Selected',
                    dataIndex: 'preselectedCourses',
                    render: (values: number[], record: any) => {
                      return (
                        <>
                          {values
                            .map(v => ({
                              value: courses.find(c => c.id === v)?.name ?? v.toString(),
                              color: record.courses.includes(v) ? '#87d068' : undefined,
                            }))
                            .map(v => colorTagRenderer(v.value, v.color))}{' '}
                        </>
                      );
                    },
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

function filterData(data: { preselectedCourses: number[]; courses: number[] }[], showAll: boolean) {
  if (showAll) {
    return data;
  }
  return data.filter(it => it.courses.length === 0 || !it.preselectedCourses.every(c => it.courses.includes(c)));
}

export default withSession(Page);
