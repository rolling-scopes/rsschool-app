import { DownOutlined, FileExcelOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Divider, Dropdown, MenuProps, Modal, Row, Space, Statistic, Table, message } from 'antd';
import { CourseMentorsApi, MentorDetailsDto } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import { AssignStudentModal } from 'components/Student';
import { PersonCell, getColumnSearchProps, numberSorter, stringSorter } from 'components/Table';
import withCourseData from 'components/withCourseData';
import { Session, withSession } from 'components/withSession';
import { SessionAndCourseProvider } from 'modules/Course/contexts';
import { MentorEndorsement } from 'modules/Mentor/components/MentorEndorsement';
import { MenuInfo } from 'rc-menu/lib/interface';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { relativeDays } from 'services/formatter';
import { CoursePageProps } from 'services/models';

type Stats = {
  recordCount: number;
  countries: { name: string; totalCount: number }[];
  students: { studentsGroupName: string; totalCount: number }[];
};

const courseMentorsApi = new CourseMentorsApi();

function getItems(mentor: MentorDetailsDto, session: Session): MenuProps['items'] {
  return [
    {
      label: 'Add student',
      key: 'student',
      disabled: !mentor.isActive,
    },
    {
      label: 'Expel',
      key: 'expel',
      disabled: !mentor.isActive,
    },
    {
      label: 'Restore',
      key: 'restore',
      disabled: mentor.isActive,
    },
    session.isAdmin
      ? {
          label: 'Endorsement',
          key: 'endorsment',
        }
      : null,
  ].filter(Boolean) as MenuProps['items'];
}

function CourseMentorsPage(props: CoursePageProps) {
  const courseId = props.course.id;
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null as Stats | null);
  const [mentors, setMentors] = useState<MentorDetailsDto[]>([]);
  const [endorsementGithubId, setEndorsementGithubId] = useState<string | null>(null);
  const [currentMentor, setCurrentMentor] = useState<string | null>(null);
  const [modal, contextHolder] = Modal.useModal();

  const service = useMemo(() => new CourseService(courseId), [courseId]);

  const studentsValueName = ['Students with a mentor', 'Students who can have a mentor'];

  useAsync(async () => {
    setLoading(true);
    const { data: records } = await courseMentorsApi.getMentorsDetails(courseId);
    const countries: Record<string, { totalCount: number }> = {};

    const studentsGroupCount = records.reduce(
      (acc, { studentsCount, maxStudentsLimit }) => {
        acc[0] += studentsCount ? studentsCount : 0;
        acc[1] += maxStudentsLimit ? maxStudentsLimit : 0;
        return acc;
      },
      [0, 0],
    );

    for (const record of records) {
      const { countryName } = record;
      if (!countries[countryName]) {
        countries[countryName] = { totalCount: 0 };
      }
      countries[countryName].totalCount++;
    }
    setLoading(false);
    setMentors(records);
    setStats({
      recordCount: records.length,
      countries: Object.keys(countries).map(k => ({
        name: k,
        totalCount: countries[k].totalCount,
      })),
      students: studentsValueName.map((valueName, idx) => ({
        studentsGroupName: valueName,
        totalCount: studentsGroupCount[idx],
      })),
    });
  }, []);

  const handleExpel = async ({ githubId }: MentorDetailsDto) => {
    try {
      setLoading(true);
      await service.expelMentor(githubId);
      setMentors(prevRecords => prevRecords.map(r => (r.githubId === githubId ? { ...r, isActive: false } : r)));
    } catch (e) {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async ({ githubId }: MentorDetailsDto) => {
    try {
      setLoading(true);
      await service.restoreMentor(githubId);
      setMentors(prevRecords => prevRecords.map(r => (r.githubId === githubId ? { ...r, isActive: true } : r)));
    } catch (e) {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  const syncWithGitHubTeams = async () => {
    try {
      setLoading(true);
      await service.postSyncRepositoriesMentors();
    } catch (e) {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = async (menuItem: MenuInfo, mentor: MentorDetailsDto) => {
    switch (menuItem.key) {
      case 'student': {
        setCurrentMentor(mentor.githubId);
        break;
      }
      case 'expel': {
        modal.confirm({
          onOk: () => handleExpel(mentor),
          title: 'Are you sure you want to expel this mentor?',
        });
        break;
      }
      case 'restore':
        modal.confirm({
          onOk: () => handleRestore(mentor),
          title: 'Do you want to restore the mentor?',
        });
        break;
      case 'endorsment':
        setEndorsementGithubId(mentor.githubId);
        break;
    }
  };

  const exportToCsv = () => (window.location.href = `/api/v2/course/${courseId}/mentors/details/csv`);

  return (
    <AdminPageLayout loading={loading} title="Course Mentors" showCourseName courses={[props.course]}>
      <div style={{ display: 'flex' }}>
        <div
          style={{
            maxWidth: 280,
            flex: 'auto',
            border: '1px rgba(0, 0, 0, 0.06) dashed',
            padding: '10px',
            marginRight: '20px',
          }}
        >
          <Statistic title="Total Count" value={stats?.recordCount} />
          <Table
            pagination={false}
            size="small"
            rowKey="name"
            dataSource={stats?.countries ?? []}
            columns={[
              { title: 'Country', dataIndex: 'name', width: 200 },
              { title: 'Count', dataIndex: 'totalCount' },
            ]}
          />
        </div>
        <div style={{ maxWidth: 310, flex: 'auto', border: '1px rgba(0, 0, 0, 0.06) dashed', padding: '10px' }}>
          <Statistic title="Max Students Count" value={stats?.students[1].totalCount} />
          <Table
            pagination={false}
            size="small"
            rowKey="studentsGroupName"
            dataSource={stats?.students ?? []}
            columns={[
              { title: 'Group of students', dataIndex: 'studentsGroupName' },
              { title: 'Count', dataIndex: 'totalCount' },
            ]}
          />
        </div>
      </div>
      <Divider dashed />
      <Row justify="end" style={{ marginBottom: 16, marginTop: 16 }}>
        <Button icon={<SyncOutlined />} style={{ marginRight: 8 }} onClick={syncWithGitHubTeams}>
          Sync with GitHub Teams
        </Button>
        <Button icon={<FileExcelOutlined />} style={{ marginRight: 8 }} onClick={exportToCsv}>
          Export CSV
        </Button>
      </Row>
      <Table<MentorDetailsDto>
        rowKey="githubId"
        rowClassName={record => (!record.isActive ? 'rs-table-row-cols-disabled' : '')}
        pagination={{ pageSize: 100 }}
        size="small"
        dataSource={mentors}
        columns={[
          {
            title: 'Mentor',
            dataIndex: 'githubId',
            sorter: stringSorter('githubId'),
            width: 200,
            render: (_, record: any) => <PersonCell value={record} />,
            ...getColumnSearchProps(['githubId', 'name']),
          },
          {
            title: 'City',
            dataIndex: 'cityName',
            key: 'cityName',
            width: 100,
            sorter: stringSorter('cityName'),
            ...getColumnSearchProps('cityName'),
          },
          {
            title: 'Country',
            dataIndex: 'countryName',
            key: 'countryName',
            width: 100,
            sorter: stringSorter('countryName'),
            ...getColumnSearchProps('countryName'),
          },
          {
            title: 'Preference',
            dataIndex: 'studentsPreference',
            sorter: stringSorter('studentsPreference'),
            width: 80,
          },
          {
            title: 'Max Students',
            dataIndex: 'maxStudentsLimit',
            sorter: numberSorter('maxStudentsLimit'),
            width: 80,
          },
          {
            title: 'Screenings',
            dataIndex: ['screenings'],
            sorter: numberSorter('screenings.completed' as any),
            width: 80,
            render: (value: any) => `${value.completed} / ${value.total}`,
          },
          {
            title: 'Interviews',
            dataIndex: ['interviews'],
            sorter: numberSorter('interviews.completed' as any),
            width: 80,
            render: (value: any) => `${value.completed} / ${value.total}`,
          },
          {
            title: 'Students',
            dataIndex: 'studentsCount',
            sorter: numberSorter('studentsCount' as any),
            width: 80,
          },
          {
            title: 'Checked Tasks',
            dataIndex: 'taskResultsStats',
            sorter: numberSorter('taskResultsStats.checked' as any),
            render: (value: any) => `${value.checked} / ${value.total}`,
          },
          {
            title: 'Last Checked Task',
            dataIndex: ['taskResultsStats', 'lastUpdatedDate'],
            sorter: numberSorter('taskResultsStats.lastUpdatedDate' as any),
            render: (value: string) => (value ? `${relativeDays(value)} days ago` : null),
          },
          {
            dataIndex: 'actions',
            width: 120,
            render: (_: string, mentor: MentorDetailsDto) => {
              const items = getItems(mentor, props.session);
              return (
                <Dropdown menu={{ items, onClick: e => handleMenuClick(e, mentor) }}>
                  <Button>
                    <Space>
                      Actions
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              );
            },
          },
        ]}
      />
      <MentorEndorsement onClose={() => setEndorsementGithubId(null)} githubId={endorsementGithubId} />
      <AssignStudentModal
        onClose={() => setCurrentMentor(null)}
        courseId={courseId}
        open={Boolean(currentMentor)}
        mentorGithuId={currentMentor}
      />
      {contextHolder}
    </AdminPageLayout>
  );
}

function Page(props: CoursePageProps) {
  return (
    <SessionAndCourseProvider course={props.course}>
      <CourseMentorsPage {...props} />
    </SessionAndCourseProvider>
  );
}

export default withCourseData(withSession(Page));
