import { BranchesOutlined, CheckCircleTwoTone, ClockCircleTwoTone, MinusCircleOutlined } from '@ant-design/icons';
import { Button, message, Row, Space, Statistic, Switch, Table, Typography } from 'antd';
import { ColumnProps } from 'antd/lib/table/Column';
import { AdminPageLayout } from 'components/PageLayout';
import { DashboardDetails } from 'components/Student';
import { CertificateCriteriaModal, ExpelCriteriaModal } from 'modules/CourseManagement/components';
import {
  boolIconRenderer,
  boolSorter,
  getColumnSearchProps,
  numberSorter,
  PersonCell,
  stringSorter,
} from 'components/Table';
import { useLoading } from 'components/useLoading';
import { isAdmin, isCourseManager, isCourseSupervisor } from 'domain/user';
import keys from 'lodash/keys';
import { useMemo, useState, useContext } from 'react';
import { useAsync, useToggle } from 'react-use';
import { CourseService, StudentDetails } from 'services/course';
import { CourseRole } from 'services/models';
import { ActiveCourseProvider, SessionContext, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';

const { Text } = Typography;

type Stats = { activeStudentsCount: number; studentsCount: number; countries: any[] };
type CertificateCriteria = {
  courseTaskIds?: number[];
  minScore?: number;
  minTotalScore?: number;
};
type ExpelCriteria = {
  courseTaskIds?: number[];
  minScore?: number;
  keepWithMentor?: boolean;
  reason: string;
};

function Page() {
  const { course, courses } = useActiveCourseContext();
  const session = useContext(SessionContext);

  const courseId = course.id;

  const [loading, withLoading] = useLoading(false);
  const [hasCourseManagerRole] = useState(isCourseManager(session, courseId));
  const [hasAdminRole] = useState(isAdmin(session));
  const hasCourseSupervisorRole = useMemo(() => isCourseSupervisor(session, course.id), [session, course.id]);
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [students, setStudents] = useState([] as StudentDetails[]);
  const [stats, setStats] = useState(null as Stats | null);
  const [activeOnly, setActiveOnly] = useState(false);
  const [details, setDetails] = useState<StudentDetails | null>(null);
  const [isExpelModalOpen, toggleExpelModal] = useToggle(false);
  const [isCertificateModalOpen, toggleCertificateModal] = useToggle(false);

  useAsync(withLoading(loadStudents), [activeOnly]);

  const issueCertificate = withLoading(async () => {
    const githubId = details?.githubId;
    if (githubId != null) {
      await courseService.createCertificate(githubId);
      message.info('The certificate has been requested.');
    }
  });

  const removeCertificate = withLoading(async () => {
    const studentId = details?.id;
    if (studentId != null) {
      await courseService.removeCertificate(studentId);
      message.info('The certificate has been removed.');
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

  const expelStudents = withLoading(async ({ minScore, keepWithMentor, courseTaskIds, reason }: ExpelCriteria) => {
    await courseService.expelStudents({ courseTaskIds, minScore }, { keepWithMentor }, reason);
    toggleExpelModal();
    loadStudents();
    message.success('Students successfully expelled');
  });

  const issueCertificates = withLoading(async (criteria: CertificateCriteria) => {
    await courseService.postCertificateStudents(criteria);
    toggleCertificateModal();
    message.success('All certificates successfully issued');
  });

  return render();

  function render() {
    return (
      <AdminPageLayout loading={loading} showCourseName courses={courses}>
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
        <Table
          rowKey="id"
          pagination={{ pageSize: 100, showSizeChanger: false }}
          size="small"
          dataSource={students}
          columns={getColumns()}
        />

        <DashboardDetails
          isLoading={loading}
          isAdmin={hasAdminRole}
          onUpdateMentor={updateMentor}
          onRestoreStudent={restoreStudent}
          onIssueCertificate={issueCertificate}
          onRemoveCertificate={removeCertificate}
          onExpelStudent={expelStudent}
          onCreateRepository={createRepository}
          onClose={() => {
            setDetails(null);
            loadStudents();
          }}
          details={details}
          courseId={course.id}
          courseManagerOrSupervisor={hasCourseManagerRole || hasCourseSupervisorRole}
        />
        <ExpelCriteriaModal
          courseId={course.id}
          onClose={toggleExpelModal}
          onSubmit={expelStudents}
          isModalOpen={isExpelModalOpen}
        />
        <CertificateCriteriaModal
          courseId={course.id}
          onClose={toggleCertificateModal}
          onSubmit={issueCertificates}
          isModalOpen={isCertificateModalOpen}
        />
      </AdminPageLayout>
    );
  }

  function renderToolbar() {
    return (
      <Space wrap>
        {hasCourseManagerRole || hasCourseSupervisorRole ? <Button onClick={exportStudents}>Export CSV</Button> : null}
        {hasCourseManagerRole ? (
          <>
            <Button onClick={toggleExpelModal} danger type="default">
              Expel Students
            </Button>
            <Button onClick={toggleCertificateModal} type="primary">
              Issue Certificates
            </Button>
          </>
        ) : null}
      </Space>
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
    countries: keys(countries).map(k => ({
      name: k,
      count: countries[k].count,
      totalCount: countries[k].totalCount,
    })),
  };
}

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Supervisor, CourseRole.Dementor]}>
        <Page />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
