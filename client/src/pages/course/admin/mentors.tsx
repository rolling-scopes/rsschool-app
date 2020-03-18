import { Button, Divider, message, Statistic, Table } from 'antd';
import { GithubUserLink, PageLayout, withSession } from 'components';
import { AssignStudentModal } from 'components/Student';
import { getColumnSearchProps, numberSorter, stringSorter } from 'components/Table';
import withCourseData from 'components/withCourseData';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, MentorDetails } from 'services/course';
import { relativeDays } from 'services/formatter';
import { CoursePageProps } from 'services/models';

type Stats = {
  recordCount: number;
  countries: { name: string; totalCount: number }[];
};

function Page(props: CoursePageProps) {
  const courseId = props.course.id;
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null as Stats | null);
  const [mentors, setMentors] = useState([] as MentorDetails[]);

  const service = useMemo(() => new CourseService(courseId), [courseId]);

  useAsync(async () => {
    setLoading(true);
    const records: any[] = await service.getMentorsWithDetails();
    const countries: Record<string, { totalCount: number }> = {};

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
    });
  }, []);

  const handleExpell = async ({ githubId }: MentorDetails) => {
    try {
      setLoading(true);
      await service.expelMentor(githubId);
      const records = mentors.map(r => (r.githubId === githubId ? { ...r, isActive: false } : r));
      setMentors(records);
    } catch (e) {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      loading={loading}
      title="Course Mentors"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      <Statistic title="Total Count" value={stats?.recordCount} />
      <Table
        style={{ width: 250 }}
        pagination={false}
        size="small"
        rowKey="name"
        dataSource={stats?.countries ?? []}
        columns={[
          { title: 'Country', dataIndex: 'name' },
          { title: 'Count', dataIndex: 'totalCount' },
        ]}
      />
      <Divider dashed />
      <Table<MentorDetails>
        bordered
        className="m-3"
        rowKey="githubId"
        rowClassName={record => (!record.isActive ? 'rs-table-row-disabled' : '')}
        pagination={{ pageSize: 100 }}
        size="small"
        dataSource={mentors}
        columns={[
          {
            title: 'Github',
            dataIndex: 'githubId',
            sorter: stringSorter('githubId'),
            width: 100,
            render: (value: string) => <GithubUserLink value={value} />,
            ...getColumnSearchProps('githubId'),
          },
          {
            title: 'Name',
            dataIndex: 'name',
            width: 120,
            sorter: stringSorter('name'),
            ...getColumnSearchProps('name'),
          },
          {
            title: 'Location',
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
            title: 'Max Student',
            dataIndex: 'maxStudentsLimit',
            sorter: numberSorter('maxStudentsLimit'),
            width: 80,
          },
          {
            title: 'Interviews Count',
            dataIndex: 'interviewsCount',
            sorter: numberSorter('interviewsCount'),
            width: 80,
          },
          {
            title: 'Students Count',
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
            title: 'Students',
            dataIndex: 'students',
            width: 80,
            render: (_: string, mentor: MentorDetails) => (
              <>
                <AssignStudentModal courseId={courseId} mentorsGithub={mentor.githubId} mentorId={mentor.id} />
              </>
            ),
          },
          {
            title: 'Actions',
            dataIndex: 'actions',
            render: (_: string, mentor: MentorDetails) => (
              <Button type="link" onClick={() => handleExpell(mentor)}>
                Expel
              </Button>
            ),
          },
        ]}
      />
    </PageLayout>
  );
}

export default withCourseData(withSession(Page));
