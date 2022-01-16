import { Button, Divider, message, Row, Statistic, Table, Popconfirm } from 'antd';
import { withSession } from 'components/withSession';
import { PageLayout } from 'components/PageLayout';
import { AssignStudentModal } from 'components/Student';
import { getColumnSearchProps, numberSorter, stringSorter, PersonCell } from 'components/Table';
import withCourseData from 'components/withCourseData';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, MentorDetails } from 'services/course';
import { relativeDays } from 'services/formatter';
import { CoursePageProps } from 'services/models';
import { SyncOutlined, FileExcelOutlined } from '@ant-design/icons';

type Stats = {
  recordCount: number;
  countries: { name: string; totalCount: number }[];
  students: { studentsGroupName: string; totalCount: number }[];
};

function Page(props: CoursePageProps) {
  const courseId = props.course.id;
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null as Stats | null);
  const [mentors, setMentors] = useState([] as MentorDetails[]);

  const service = useMemo(() => new CourseService(courseId), [courseId]);

  const studentsValueName = ['Students with a mentor', 'Students who can have a mentor'];

  useAsync(async () => {
    setLoading(true);
    const records: any[] = await service.getMentorsWithDetails();
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

  const handleExpel = async ({ githubId }: MentorDetails) => {
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

  const handleRestore = async ({ githubId }: MentorDetails) => {
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

  const exportToCsv = () => (window.location.href = `/api/course/${courseId}/mentors/details/csv`);

  return (
    <PageLayout
      loading={loading}
      title="Course Mentors"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
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
      <Table<MentorDetails>
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
            width: 100,
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
            title: 'Actions',
            dataIndex: 'actions',
            render: (_: string, mentor: MentorDetails) =>
              mentor.isActive ? (
                <>
                  <Popconfirm
                    onConfirm={() => handleExpel(mentor)}
                    title="Do you want to exclude a mentor from this course?"
                  >
                    <Button type="link" href="#">
                      Expel
                    </Button>
                  </Popconfirm>
                  <AssignStudentModal courseId={courseId} mentorGithuId={mentor.githubId} />
                </>
              ) : (
                <>
                  <Popconfirm
                    onConfirm={() => handleRestore(mentor)}
                    title="Do you want to restore mentor for this course?"
                  >
                    <Button type="link" href="#">
                      Restore
                    </Button>
                  </Popconfirm>
                </>
              ),
          },
        ]}
      />
    </PageLayout>
  );
}

export default withCourseData(withSession(Page));
