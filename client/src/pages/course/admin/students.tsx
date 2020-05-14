import {
  BranchesOutlined,
  CheckCircleTwoTone,
  ClockCircleTwoTone,
  FileExcelOutlined,
  MinusCircleOutlined,
  CloseCircleTwoTone,
} from '@ant-design/icons';
import { Button, message, Row, Statistic, Switch, Table, Typography } from 'antd';
import { ColumnProps } from 'antd/lib/table/Column';
import { PageLayout, withSession } from 'components';
import { DashboardDetails, ExpelCriteria } from 'components/Student';
import {
  boolIconRenderer,
  boolSorter,
  getColumnSearchProps,
  numberSorter,
  PersonCell,
  stringSorter,
} from 'components/Table';
import { useLoading } from 'components/useLoading';
import withCourseData from 'components/withCourseData';
import { isCourseManager } from 'domain/user';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { useAsync, useToggle } from 'react-use';
import { CourseService, StudentDetails } from 'services/course';
import { CoursePageProps } from 'services/models';

const { Text } = Typography;

type Stats = { activeStudentsCount: number; studentsCount: number; countries: any[] };
type Props = CoursePageProps;

function Page(props: Props) {
  const courseId = props.course.id;

  const [loading, withLoading] = useLoading(false);
  const [isManager] = useState(isCourseManager(props.session, props.course.id));
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [students, setStudents] = useState([] as StudentDetails[]);
  const [stats, setStats] = useState(null as Stats | null);
  const [activeOnly, setActiveOnly] = useState(false);
  const [details, setDetails] = useState<StudentDetails | null>(null);
  const [expelModel, setExpelMode] = useToggle(false);

  useAsync(withLoading(loadStudents), [activeOnly]);

  const createRepositories = withLoading(async () => {
    await courseService.createRepositories();
    message.info('The job for creating repositories has been submitted');
  });

  const issueCertificate = withLoading(async () => {
    const githubId = details?.githubId;
    if (githubId != null) {
      await courseService.createCertificate(githubId);
      message.info('The certificate has been requested.');
    }
  });

  const createRepository = withLoading(async () => {
    const githubId = details?.githubId;
    if (githubId != null) {
      const { repository } = await courseService.createRepository(githubId);
      const newStudents = students.map(s => (s.githubId === githubId ? { ...s, repository: repository } : s));
      setStudents(newStudents);
    }
  });

  const expelStudent = withLoading(async (text: string) => {
    const githubId = details?.githubId;
    if (githubId != null) {
      await courseService.expelStudent(githubId, text);
      message.info('Student has been expelled');
    }
  });

  const restoreStudent = withLoading(async () => {
    const githubId = details?.githubId;
    if (githubId != null) {
      await courseService.restoreStudent(githubId);
      message.info('Student has been restored');
    }
  });

  const updateMentor = withLoading(async (mentorGithuId: string | null = null) => {
    const githubId = details?.githubId;
    if (details != null && githubId != null) {
      const student = await courseService.updateStudent(githubId, { mentorGithuId });
      setDetails({ ...details, mentor: student.mentor });
    }
  });

  const expelStudents = withLoading(async (criteria: any, options: any, expellingReason: string) => {
    await courseService.expelStudents(criteria, options, expellingReason);
    setExpelMode();
    loadStudents();
  });

  return render();

  function render() {
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
            <Switch checked={activeOnly} onChange={setActiveOnly} />
          </div>
          <div>{renderToolbar()}</div>
        </Row>
        <Table rowKey="id" pagination={{ pageSize: 100 }} size="small" dataSource={students} columns={getColumns()} />

        <DashboardDetails
          onUpdateMentor={updateMentor}
          onRestoreStudent={restoreStudent}
          onIssueCertificate={issueCertificate}
          onExpelStudent={expelStudent}
          onCreateRepository={createRepository}
          onClose={() => {
            setDetails(null);
            loadStudents();
          }}
          details={details}
          courseId={props.course.id}
        />
        {expelModel ? (
          <ExpelCriteria courseId={props.course.id} onClose={setExpelMode} onApply={expelStudents} />
        ) : null}
      </PageLayout>
    );
  }

  function renderToolbar() {
    return (
      <>
        {isManager ? (
          <>
            <Button icon={<BranchesOutlined />} style={{ marginRight: 8 }} onClick={createRepositories}>
              Create Repos
            </Button>
            <Button icon={<CloseCircleTwoTone twoToneColor="red" />} style={{ marginRight: 8 }} onClick={setExpelMode}>
              Expel
            </Button>
          </>
        ) : null}
        <Button icon={<FileExcelOutlined />} style={{ marginRight: 8 }} onClick={exportStudents}>
          Export CSV
        </Button>
      </>
    );
  }

  function exportStudents() {
    courseService.exportStudentsCsv(activeOnly);
  }

  async function loadStudents() {
    const courseStudents = await courseService.getCourseStudentsWithDetails(activeOnly);
    setStudents(courseStudents);
    setStats(calculateStats(courseStudents));
  }

  function getColumns(): ColumnProps<any>[] {
    return [
      {
        title: 'Active',
        dataIndex: 'isActive',
        width: 50,
        render: boolIconRenderer,
        sorter: boolSorter('isActive'),
      },
      {
        title: 'Student',
        dataIndex: 'githubId',
        sorter: stringSorter('githubId'),
        key: 'githubId',
        render: (_, record: any) => <PersonCell value={record} />,
        ...getColumnSearchProps(['githubId', 'name']),
      },
      {
        title: 'Mentor',
        dataIndex: 'mentor',
        sorter: stringSorter<any>('mentor.githubId'),
        render: (value: any) => (value ? <PersonCell value={value} /> : null),
        ...getColumnSearchProps(['mentor.githubId', 'mentor.name']),
      },
      {
        title: 'City',
        dataIndex: 'cityName',
        width: 80,
        sorter: stringSorter('cityName'),
        ...getColumnSearchProps('cityName'),
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
        title: 'Screening',
        dataIndex: 'interviews',
        width: 60,
        render: (value: any[]) => {
          if (value.length === 0) {
            return <MinusCircleOutlined title="No Interview" />;
          }
          if (value.every(e => e.isCompleted)) {
            return <CheckCircleTwoTone title="Completed" twoToneColor="#52c41a" />;
          } else {
            return <ClockCircleTwoTone title="Assigned" />;
          }
        },
      },
      {
        title: <BranchesOutlined />,
        dataIndex: 'repository',
        width: 80,
        render: (value: string) => (value ? <a href={value}>Link</a> : null),
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
        title: '',
        dataIndex: 'actions',
        fixed: 'right',
        width: 60,
        render: (_: any, record: StudentDetails) => (
          <Button type="default" onClick={() => setDetails(record)}>
            More
          </Button>
        ),
      },
    ];
  }
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

export default withCourseData(withSession(Page));
