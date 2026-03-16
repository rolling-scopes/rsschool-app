import { BranchesOutlined, CheckCircleTwoTone, ClockCircleTwoTone, MinusCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Row, Space, Statistic, Switch, Table, Typography } from 'antd';
import { ColumnProps } from 'antd/lib/table/Column';
import { AdminPageLayout } from '@client/shared/components/PageLayout';
import { DashboardDetails } from '@client/components/Student';
import {
  boolIconRenderer,
  boolSorter,
  getColumnSearchProps,
  numberSorter,
  PersonCell,
  stringSorter,
} from '@client/shared/components/Table';
import { isAdmin, isCourseManager, isCourseSupervisor } from '@client/domain/user';
import { useMessage } from '@client/hooks';
import keys from 'lodash/keys';
import { SessionContext, SessionProvider, useActiveCourseContext } from '@client/modules/Course/contexts';
import { CertificateCriteriaModal, ExpelCriteriaModal } from '@client/modules/CourseManagement/components';
import { useContext, useMemo, useState } from 'react';
import { useToggle } from 'react-use';
import { CourseService, StudentDetails } from '@client/services/course';
import { CourseRole } from '@client/services/models';

const { Text } = Typography;

type Stats = { activeStudentsCount: number; studentsCount: number; countries: unknown[] };

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
  const { message } = useMessage();
  const { course, courses } = useActiveCourseContext();
  const session = useContext(SessionContext);

  const courseId = course.id;
  const hasAdminRole = isAdmin(session);

  const [hasCourseManagerRole] = useState(isCourseManager(session, courseId));
  const hasCourseSupervisorRole = useMemo(() => isCourseSupervisor(session, course.id), [session, course.id]);
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [students, setStudents] = useState([] as StudentDetails[]);
  const [stats, setStats] = useState(null as Stats | null);
  const [activeOnly, setActiveOnly] = useState(false);
  const [details, setDetails] = useState<StudentDetails | null>(null);
  const [isExpelModalOpen, toggleExpelModal] = useToggle(false);
  const [isCertificateModalOpen, toggleCertificateModal] = useToggle(false);

  const loadStudentsRequest = useRequest(
    async () => {
      const courseStudents = await courseService.getCourseStudentsWithDetails(activeOnly);
      return {
        stats: calculateStats(courseStudents),
        students: courseStudents,
      };
    },
    {
      refreshDeps: [activeOnly, details],
      onSuccess: data => {
        setStudents(data.students);
        setStats(data.stats);
      },
    },
  );

  const { loading: loadingIssueCertificate, runAsync: issueCertificate } = useRequest(
    async () => {
      const githubId = details?.githubId;
      if (githubId != null) {
        await courseService.createCertificate(githubId);
        message.info('The certificate has been requested.');
      }
    },
    { manual: true },
  );

  const { loading: loadingRemoveCertificate, runAsync: removeCertificate } = useRequest(
    async () => {
      const studentId = details?.id;
      if (studentId != null) {
        await courseService.removeCertificate(studentId);
        message.info('The certificate has been removed.');
      }
    },
    { manual: true },
  );

  const { loading: loadingCreateRepository, runAsync: createRepository } = useRequest(
    async () => {
      const githubId = details?.githubId;
      if (githubId != null) {
        const { repository } = await courseService.createRepository(githubId);
        const newStudents = students.map(s => (s.githubId === githubId ? { ...s, repository: repository } : s));
        setStudents(newStudents);
      }
    },
    { manual: true },
  );

  const { loading: loadingExpelStudent, runAsync: expelStudent } = useRequest(
    async (text: string) => {
      const githubId = details?.githubId;
      if (githubId != null) {
        await courseService.expelStudent(githubId, text);
        message.info('Student has been expelled');
        setDetails(null);
      }
    },
    { manual: true },
  );

  const { loading: loadingRestoreStudent, runAsync: restoreStudent } = useRequest(
    async () => {
      const githubId = details?.githubId;
      if (githubId != null) {
        await courseService.restoreStudent(githubId);
        message.info('Student has been restored');
        setDetails(null);
      }
    },
    { manual: true },
  );

  const { loading: loadingUpdateMentor, runAsync: updateMentor } = useRequest(
    async (mentorGithuId: string | null = null) => {
      const githubId = details?.githubId;
      if (details != null && githubId != null) {
        const student = await courseService.updateStudent(githubId, { mentorGithuId });
        setDetails({ ...details, mentor: student.mentor });
      }
    },
    { manual: true },
  );

  const { loading: loadingExpelStudents, runAsync: expelStudents } = useRequest(
    async ({ minScore, keepWithMentor, courseTaskIds, reason }: ExpelCriteria) => {
      await courseService.expelStudents({ courseTaskIds, minScore }, { keepWithMentor }, reason);
      toggleExpelModal();
      await loadStudentsRequest.runAsync();
      message.success('Students successfully expelled');
    },
    { manual: true },
  );

  const { loading: loadingIssueCertificates, runAsync: issueCertificates } = useRequest(
    async (criteria: CertificateCriteria) => {
      await courseService.postCertificateStudents(criteria);
      toggleCertificateModal();
      message.success('All certificates successfully issued');
    },
    { manual: true },
  );

  const loading =
    loadStudentsRequest.loading ||
    loadingIssueCertificate ||
    loadingRemoveCertificate ||
    loadingCreateRepository ||
    loadingExpelStudent ||
    loadingRestoreStudent ||
    loadingUpdateMentor ||
    loadingExpelStudents ||
    loadingIssueCertificates;

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
            loadStudentsRequest.runAsync();
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

  function getColumns(): ColumnProps<StudentDetails>[] {
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
        render: (_, record) => <PersonCell value={record} />,
        ...getColumnSearchProps(['githubId', 'name']),
      },
      {
        title: 'Mentor',
        dataIndex: 'mentor',
        sorter: stringSorter('mentor.githubId' as keyof StudentDetails),
        render: value => (value ? <PersonCell value={value} /> : null),
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
        render: (value: StudentDetails['interviews']) => {
          if (value.length === 0) {
            return <MinusCircleOutlined title="No Interview" />;
          }
          if (value.every(e => e.isCompleted)) {
            return <CheckCircleTwoTone title="Completed" twoToneColor="#52c41a" />;
          }
          return <ClockCircleTwoTone title="Assigned" />;
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
        render: (_, record) => (
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
      count: countries[k]?.count,
      totalCount: countries[k]?.totalCount,
    })),
  };
}

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Supervisor, CourseRole.Dementor]}>
      <Page />
    </SessionProvider>
  );
}
