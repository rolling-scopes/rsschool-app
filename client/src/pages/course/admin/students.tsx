import {
  BranchesOutlined,
  FileExcelOutlined,
  MoreOutlined,
  SolutionOutlined,
  CloseCircleTwoTone,
} from '@ant-design/icons';
import { Button, Dropdown, Menu, message, Row, Statistic, Switch, Table, Typography } from 'antd';
import { ColumnProps } from 'antd/lib/table/Column';
import { GithubUserLink, PageLayout, StudentExpelModal, withSession } from 'components';
import { boolIconRenderer, boolSorter, getColumnSearchProps, numberSorter, stringSorter } from 'components/Table';
import withCourseData from 'components/withCourseData';
import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, StudentDetails } from 'services/course';
import { CoursePageProps } from 'services/models';
import css from 'styled-jsx/css';

const { Text } = Typography;

type Stats = { activeStudentsCount: number; studentsCount: number; countries: any[] };
type Props = CoursePageProps;

function Page(props: Props) {
  const courseId = props.course.id;

  const [loading, setLoading] = useState(false);
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [students, setStudents] = useState([] as StudentDetails[]);
  const [stats, setStats] = useState(null as Stats | null);
  const [expelledStudent, setExpelledStudent] = useState(null as Partial<StudentDetails> | null);
  const [activeOnly, setActiveOnly] = useState(true);

  const loadStudents = useCallback(
    async (activeOnly: boolean) => {
      const courseStudents = await courseService.getCourseStudentsWithDetails(activeOnly);
      setStudents(courseStudents);
      setStats(calculateStats(courseStudents));
    },
    [courseService],
  );

  const actions = useMemo(() => createActions(courseService, setLoading), [courseService, setLoading]);

  useAsync(async () => {
    setLoading(true);
    await loadStudents(activeOnly);
    setLoading(false);
  }, [courseService]);

  const handleExpel = record => setExpelledStudent(record);

  const handleCreateRepo = useCallback(
    async ({ githubId }: { githubId: string }) => {
      try {
        setLoading(true);
        const { repository } = await courseService.createRepository(githubId);
        const newStudents = students.map(s => (s.githubId === githubId ? { ...s, repository: repository } : s));
        setStudents(newStudents);
      } catch (e) {
        message.error('An error occured. Please try later.');
      } finally {
        setLoading(false);
      }
    },
    [courseService],
  );

  const handleActiveOnlyChange = async () => {
    setLoading(true);
    const value = !activeOnly;
    setActiveOnly(value);
    await loadStudents(value);
    setLoading(false);
  };

  function getActionsMenu(record: StudentDetails) {
    return (
      <Menu>
        <Menu.Item onClick={() => handleExpel(record)}>
          <CloseCircleTwoTone twoToneColor="red" />
          Expel Student
        </Menu.Item>
        <Menu.Item disabled={!!record.repository} onClick={() => handleCreateRepo(record)}>
          <BranchesOutlined />
          Create Repository
        </Menu.Item>
        <Menu.Item onClick={() => actions.issueCertificate(record)}>
          <SolutionOutlined />
          Issue Certificate
        </Menu.Item>
      </Menu>
    );
  }

  const getToolbarActions = useCallback(() => {
    const { isAdmin, coursesRoles } = props.session;
    const isManager = coursesRoles?.[props.course.id]?.includes('manager');
    return (
      <>
        {isManager || isAdmin ? (
          <Button icon={<BranchesOutlined />} style={{ marginRight: 8 }} onClick={actions.createRepositories}>
            Create Repos
          </Button>
        ) : null}
        <Button
          icon={<FileExcelOutlined />}
          style={{ marginRight: 8 }}
          onClick={() => courseService.exportStudentsCsv(activeOnly)}
        >
          Export CSV
        </Button>
      </>
    );
  }, [courseService, actions]);

  return (
    <PageLayout loading={loading} githubId={props.session.githubId}>
      <Statistic
        title="Active Students"
        value={stats?.activeStudentsCount ?? 0}
        suffix={`/ ${stats?.studentsCount ?? 0}`}
      />
      <Row justify="space-between" style={{ marginBottom: 16, marginTop: 16 }}>
        <div>
          <span style={{ display: 'inline-block', lineHeight: '24px' }}>Active Students Only</span>{' '}
          <Switch checked={activeOnly} onChange={handleActiveOnlyChange} />
        </div>
        <div>{getToolbarActions()}</div>
      </Row>
      <Table
        rowKey="id"
        pagination={{ pageSize: 100 }}
        size="small"
        dataSource={students}
        columns={getColumns(getActionsMenu)}
      />
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
      <style jsx>{styles}</style>
    </PageLayout>
  );
}

function getColumns(getActionsMenu): ColumnProps<any>[] {
  return [
    {
      title: 'Active',
      dataIndex: 'isActive',
      width: 50,
      render: boolIconRenderer,
      sorter: boolSorter('isActive'),
    },
    {
      title: 'Github',
      dataIndex: 'githubId',
      sorter: stringSorter('githubId'),
      key: 'githubId',
      render: (value: string) => <GithubUserLink value={value} />,
      ...getColumnSearchProps('githubId'),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: stringSorter('name'),
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Mentor',
      dataIndex: ['mentor', 'githubId'],
      sorter: stringSorter<any>('mentor.githubId'),
      render: (value: string) => (value ? <GithubUserLink value={value} /> : null),
      ...getColumnSearchProps('mentor.githubId'),
    },
    {
      title: 'City',
      dataIndex: 'locationName',
      width: 80,
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
      title: 'Interview',
      dataIndex: 'interviews',
      width: 60,
      render: (value: any[]) => boolIconRenderer(!_.isEmpty(value) && _.every(value, 'isCompleted')),
    },
    // {
    //   title: 'Assigned',
    //   dataIndex: 'assignedChecks',
    //   width: 50,
    //   render: (value: any[]) => value.map(v => v.name).join(', '),
    // },
    {
      title: <BranchesOutlined />,
      dataIndex: 'repository',
      width: 80,
      render: value => (value ? <a href={value}>Link</a> : null),
    },
    {
      title: 'Total',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 80,
      align: 'right',
      sorter: numberSorter('totalScore'),
      render: (value: number) => <Text strong>{value.toFixed(1)}</Text>,
    },
    {
      dataIndex: 'actions',
      render: (_, record: StudentDetails) => (
        <Dropdown trigger={['click']} overlay={getActionsMenu(record)}>
          <Button size="small" type="default">
            More
            <MoreOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
}

function calculateStats(students: StudentDetails[]) {
  let activeStudentsCount = 0;
  const countries: Record<string, { count: number; totalCount: number }> = {};

  for (const student of students) {
    const { countryName } = student;
    if (!countries[countryName]) {
      countries[countryName] = { count: 0, totalCount: 0 };
    }
    countries[countryName].totalCount++;
    if (student.isActive) {
      activeStudentsCount++;
      countries[countryName].count++;
    }
  }
  return {
    activeStudentsCount,
    studentsCount: students.length,
    countries: _.keys(countries).map(k => ({
      name: k,
      count: countries[k].count,
      totalCount: countries[k].totalCount,
    })),
  };
}

function createActions(courseService: CourseService, setLoading: (value: boolean) => void) {
  return {
    issueCertificate: async ({ githubId }: { githubId: string }) => {
      try {
        setLoading(true);
        await courseService.createCertificate(githubId);
        message.info('The certificate has been requested.');
      } catch (e) {
        message.error('An error occured. Please try later.');
      } finally {
        setLoading(false);
      }
    },
    createRepositories: async () => {
      try {
        setLoading(true);
        await courseService.createRepositories();
        message.info('The job for creating repositories has been submitted');
      } catch (e) {
        message.error('An error occured. Please try later.');
      } finally {
        setLoading(false);
      }
    },
  };
}

const styles = css`
  :global(.rs-table-row-disabled) {
    opacity: 0.25;
  }
`;

export default withCourseData(withSession(Page));
