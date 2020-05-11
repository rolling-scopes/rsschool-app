import { Col, Row, Layout, Select, Spin, Table, Form, message, Checkbox, Button } from 'antd';
import { AdminSider, GithubUserLink, Header } from 'components';
import { stringSorter, tagsRenderer, colorTagRenderer, getColumnSearchProps } from 'components/Table';
import withSession, { Session } from 'components/withSession';
import { useState, useCallback } from 'react';
import { useAsync } from 'react-use';
import { MentorRegistry, MentorRegistryService } from 'services/mentorRegistry';
import { Course } from 'services/models';
import { CoursesService } from 'services/courses';
import { ModalForm } from 'components/Forms';
import css from 'styled-jsx/css';
import { SafetyCertificateTwoTone } from '@ant-design/icons';
import { isAnyCourseManager } from '../../domain/user';

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
  const [maxStudents, setMaxStudents] = useState(0);

  const [courses, setCourses] = useState<Course[]>([]);
  const [modalData, setModalData] = useState(null as Partial<any> | null);

  const updateData = (showAll: boolean, allData: any[]) => {
    setShowAll(showAll);
    const data = filterData(allData, showAll);
    setData(data);
    setMaxStudents(data.reduce((sum, it) => sum + it.maxStudentsLimit, 0));
  };

  const loadData = useCallback(async () => {
    setLoading(true);

    const allData = await mentorRegistryService.getMentors();
    const courses = await coursesService.getCourses();

    setAllData(allData);
    updateData(showAll, allData);

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
        title="Record"
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
      <AdminSider isAdmin={props.session.isAdmin} isCourseManager={isAnyCourseManager(props.session)} />
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
                      updateData(value, allData);
                    }}
                  >
                    Show All
                  </Checkbox>
                </Form.Item>
                <Button onClick={() => (window.location.href = `/api/registry/mentors/csv`)}>Export CSV</Button>
              </Row>
            </Col>
            <Col style={{ marginBottom: 8 }}> Total mentors: {data.length} </Col>
            <Col style={{ marginBottom: 8 }}> Total max students: {maxStudents} </Col>
            <Col>
              <Table<MentorRegistry>
                bordered
                pagination={{ pageSize: PAGINATION }}
                size="small"
                rowKey="id"
                dataSource={data}
                scroll={{ x: 1600 }}
                columns={[
                  {
                    fixed: 'left',
                    width: 200,
                    title: 'Github',
                    dataIndex: 'githubId',
                    sorter: stringSorter('githubId'),
                    render: (value: string, { name }) => {
                      return (
                        <>
                          <GithubUserLink value={value} />
                          <div>{name}</div>
                        </>
                      );
                    },
                    ...getColumnSearchProps(['githubId', 'name']),
                  },
                  {
                    title: 'City',
                    dataIndex: 'cityName',
                    width: 120,
                    sorter: stringSorter('cityName'),
                    ...getColumnSearchProps('cityName'),
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
                    render: renderPreselectedCourses(courses),
                  },
                  {
                    title: 'Max students',
                    width: 80,
                    dataIndex: 'maxStudentsLimit',
                  },
                  {
                    title: 'Students Location',
                    width: 100,
                    dataIndex: 'preferedStudentsLocation',
                    sorter: stringSorter('githubId'),
                  },
                  {
                    title: 'Technical Mentoring',
                    dataIndex: 'technicalMentoring',
                    render: tagsRenderer,
                  },
                  {
                    title: 'Info',
                    dataIndex: 'info',
                    render: renderInfo,
                    width: 120,
                  },
                  {
                    title: 'Comment',
                    dataIndex: 'comment',
                  },
                  {
                    fixed: 'right',
                    width: 80,
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

function renderInfo(_: any, record: any) {
  const isMentor = record.courses.some((id: string) => !record.preselectedCourses.includes(id));
  return (
    <div className="info-icons">
      {record.englishMentoring ? <div title="Ready to mentor in English" className="icon-flag-uk" /> : null}
      {isMentor ? <div title="Mentor in the past" className="icon-mentor" /> : null}
      {record.hasCertificate ? (
        <SafetyCertificateTwoTone
          title="Completed with certificate"
          className="icon-certificate"
          twoToneColor="#52c41a"
        />
      ) : null}
      <style jsx>{styles}</style>
    </div>
  );
}

function filterData(
  data: { maxStudentsLimit: number; preselectedCourses: number[]; courses: number[] }[],
  showAll: boolean,
) {
  if (showAll) {
    return data;
  }
  return data.filter(
    it =>
      it.courses.length === 0 ||
      !it.preselectedCourses.length ||
      !it.preselectedCourses.every(c => it.courses.includes(c)),
  );
}

function renderPreselectedCourses(courses: Course[]) {
  return (values: number[], record: any) => {
    return (
      <>
        {values
          .map(v => ({
            value: courses.find(c => c.id === v)?.name ?? v.toString(),
            color: record.courses.includes(v) ? '#87d068' : undefined,
          }))
          .map(v => colorTagRenderer(v.value, v.color))}
      </>
    );
  };
}

export default withSession(Page);

const styles = css`
  .info-icons {
    display: flex;
  }

  .info-icons > div {
    margin-right: 8px;
  }

  :global(.icon-certificate svg) {
    width: 16px;
    height: 16px;
  }

  .icon-flag-uk {
    background-image: url(/static/images/united-kingdom.png);
    background-position: center;
    background-size: contain;
    width: 16px;
    height: 16px;
  }

  .icon-mentor {
    background-image: url(/static/svg/master-yoda.svg);
    background-position: center;
    background-size: contain;
    width: 16px;
    height: 16px;
  }
`;
