import { Button, Col, Divider, Form, Layout, message, Row, Spin, Statistic, Table, Typography } from 'antd';
import { GithubUserLink, Header, StudentExpelModal, withSession } from 'components';
import { CourseTaskSelect, ModalForm } from 'components/Forms';
import { boolIconRenderer, getColumnSearchProps, numberSorter, stringSorter } from 'components/Table';
import withCourseData from 'components/withCourseData';
import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseTask, StudentDetails } from 'services/course';
import { CoursePageProps } from 'services/models';
import css from 'styled-jsx/css';

const { Text } = Typography;

type Stats = {
  activeStudentCount: number;
  studentCount: number;
  countries: any[];
};
type Props = CoursePageProps;

function Page(props: Props) {
  const courseId = props.course.id;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const service = useMemo(() => new CourseService(courseId), [courseId]);
  const [students, setStudents] = useState([] as StudentDetails[]);
  const [stats, setStats] = useState(null as Stats | null);
  const [crossCheckTasks, setCrossCheckTasks] = useState([] as CourseTask[]);
  const [crossCheckModal, setCrossCheckModal] = useState(null as string | null);
  const [expelledStudent, setExpelledStudent] = useState(null as Partial<StudentDetails> | null);

  const loadStudents = useCallback(async () => {
    const courseStudents = await service.getCourseStudentsWithDetails();
    let activeStudentCount = 0;
    const countries: Record<string, { count: number; totalCount: number }> = {};

    for (const courseStudent of courseStudents) {
      const { countryName } = courseStudent;
      if (!countries[countryName]) {
        countries[countryName] = { count: 0, totalCount: 0 };
      }
      countries[countryName].totalCount++;
      if (courseStudent.isActive) {
        activeStudentCount++;
        countries[countryName].count++;
      }
    }
    setStudents(courseStudents);
    setStats({
      activeStudentCount,
      studentCount: courseStudents.length,
      countries: _.keys(countries).map(k => ({
        name: k,
        count: countries[k].count,
        totalCount: countries[k].totalCount,
      })),
    });
  }, [courseId]);

  useAsync(async () => {
    await loadStudents();
    const tasks = await service.getCourseTasks();
    const crossCheckTasks = tasks.filter(t => t.checker === 'crossCheck');
    setCrossCheckTasks(crossCheckTasks);
    setLoading(false);
  }, [courseId]);

  const handleExpel = record => setExpelledStudent(record);

  const handleCreateRepo = async ({ githubId }: StudentDetails) => {
    try {
      setLoading(true);
      const { repository } = await service.createRepository(githubId);
      const newStudents = students.map(s => (s.githubId === githubId ? { ...s, repository: repository } : s));
      setStudents(newStudents);
    } catch (e) {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrossCheckDistribution = () => setCrossCheckModal('distribution');
  const handleCrossCheckCompletion = () => setCrossCheckModal('completion');
  const handleCrossCheckCancel = () => setCrossCheckModal(null);

  const handleCreateRepos = () => {
    try {
      service.createRepositories();
      message.info('The job for creating repositories has been submitted');
    } catch (e) {
      message.error('An error occured. Please try later.');
    }
  };

  const handleModalSubmit = async (event: React.FormEvent) => {
    try {
      event.preventDefault();
      const values = await form.validateFields().catch(() => null);
      if (values == null) {
        return;
      }
      if (crossCheckModal === 'distribution') {
        await service.createCrossCheckDistribution(values.courseTaskId);
      } else {
        await service.createCrossCheckCompletion(values.courseTaskId);
      }
      form.resetFields();
      message.success('Cross-check distrubtion has been created');
      setCrossCheckModal(null);
    } catch (e) {
      message.error('An error occurred.');
    }
  };

  const renderModal = modalData => {
    return (
      <ModalForm
        form={form}
        getInitialValues={getInitialValues}
        data={modalData}
        title="Cross-Check"
        submit={handleModalSubmit}
        cancel={handleCrossCheckCancel}
      >
        <Spin spinning={loading}>
          <Row gutter={24}>
            <Col span={24}>
              <CourseTaskSelect data={crossCheckTasks} />
            </Col>
          </Row>
        </Spin>
      </ModalForm>
    );
  };

  return (
    <div>
      <Header username={props.session.githubId} />
      <Layout.Content style={{ margin: 8 }}>
        <Spin spinning={loading}>
          <Statistic
            className="m-3"
            title="Active Students"
            value={stats?.activeStudentCount}
            suffix={`/ ${stats?.studentCount}`}
          />
          <Divider dashed />
          <Row justify="end" className="m-3">
            {props.session.isAdmin && (
              <>
                <Button style={{ marginLeft: 8 }} onClick={handleCreateRepos}>
                  Create Repos
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={handleCrossCheckDistribution}>
                  Cross-Check Distribution
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={handleCrossCheckCompletion}>
                  Cross-Check Completion
                </Button>
              </>
            )}
          </Row>
          <Table
            rowKey="id"
            pagination={{ pageSize: 100 }}
            size="small"
            dataSource={students}
            columns={getColumns(handleCreateRepo, handleExpel)}
          />
        </Spin>
        <StudentExpelModal
          onCancel={() => setExpelledStudent(null)}
          onOk={() => {
            const newStudents = students.map(s =>
              expelledStudent && s.id === expelledStudent.id ? { ...s, isActive: false } : s,
            );
            setStudents(newStudents);
            setExpelledStudent(null);
          }}
          githubId={expelledStudent?.githubId}
          visible={!!expelledStudent}
          courseId={courseId}
        />
        {renderModal(crossCheckModal)}
      </Layout.Content>
      <style jsx>{styles}</style>
    </div>
  );
}

function getColumns(handleCreateRepo: any, handleExpel: any) {
  return [
    {
      title: 'Github',
      dataIndex: 'githubId',
      sorter: stringSorter('githubId'),
      width: 120,
      key: 'githubId',
      render: (value: string) => <GithubUserLink value={value} />,
      ...getColumnSearchProps('githubId'),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200,
      sorter: stringSorter('name'),
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Mentor',
      dataIndex: ['mentor', 'githubId'],
      width: 100,
      render: (value: string) => (value ? <GithubUserLink value={value} /> : null),
      ...getColumnSearchProps('mentor.githubId'),
    },
    {
      title: 'Location',
      dataIndex: 'locationName',
      width: 120,
      sorter: stringSorter('locationName'),
      ...getColumnSearchProps('locationName'),
    },
    {
      title: 'Country',
      dataIndex: 'countryName',
      key: 'countryName',
      width: 80,
      sorter: stringSorter('countryName'),
      ...getColumnSearchProps('countryName'),
    },
    {
      title: 'Screening Interview',
      dataIndex: 'interviews',
      width: 50,
      render: (value: any[]) => boolIconRenderer(!_.isEmpty(value) && _.every(value, 'isCompleted')),
    },
    {
      title: 'Repository',
      dataIndex: 'repository',
      width: 80,
      render: value => (value ? <a href={value}>Link</a> : null),
    },
    {
      title: 'Total',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 80,
      sorter: numberSorter('totalScore'),
      render: value => <Text strong>{value}</Text>,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record: StudentDetails) => (
        <>
          {!record.repository && record.isActive && (
            <Button style={{ marginRight: '8px' }} type="dashed" onClick={() => handleCreateRepo(record)}>
              Create Repo
            </Button>
          )}
          {record.isActive && (
            <Button type="dashed" onClick={() => handleExpel()}>
              Expel
            </Button>
          )}
        </>
      ),
    },
  ];
}

function getInitialValues(modalData) {
  return modalData;
}

const styles = css`
  :global(.rs-table-row-disabled) {
    opacity: 0.25;
  }
`;

export default withCourseData(withSession(Page));
