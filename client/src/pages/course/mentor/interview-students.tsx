import { Table } from 'antd';
import { GithubUserLink, PageLayout, withSession } from 'components';
import { getColumnSearchProps, numberSorter, stringSorter } from 'components/Table';
import { useLoading } from 'components/useLoading';
import withCourseData from 'components/withCourseData';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';

function Page(props: CoursePageProps) {
  const courseId = props.course.id;

  const [loading, withLoading] = useLoading(false);
  const [availableStudents, setAvailableStudents] = useState([] as any[]);
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const loadData = async () => {
    const availableStudents = await courseService.getAvailableStudentsForStageInterviews();
    setAvailableStudents(availableStudents);
  };

  const inviteStudent = withLoading(async (githubId: string) => {
    await courseService.createInterview(githubId, props.session.githubId);
    await loadData();
  });

  useAsync(withLoading(loadData), []);

  return (
    <PageLayout
      loading={loading}
      title="Technical Screening: Available Students"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      <Table
        pagination={{ pageSize: 100 }}
        size="small"
        dataSource={availableStudents}
        rowKey="id"
        columns={[
          {
            title: 'Github',
            dataIndex: 'githubId',
            sorter: stringSorter('githubId'),
            width: 180,
            render: (value: string) => <GithubUserLink value={value} />,
            ...getColumnSearchProps('githubId'),
          },
          {
            title: 'Interview Rating',
            dataIndex: 'rating',
            sorter: numberSorter('rating'),
            width: 210,
          },
          {
            title: 'Name',
            dataIndex: 'name',
            width: 180,
            ...getColumnSearchProps('name'),
          },
          {
            title: 'City',
            dataIndex: 'cityName',
            sorter: stringSorter('cityName'),
            width: 180,
            ...getColumnSearchProps('cityName'),
          },
          {
            title: 'Score',
            dataIndex: 'totalScore',
            sorter: numberSorter('totalScore'),
          },
          {
            title: 'Actions',
            dataIndex: 'actions',
            render: (_, record) => <a onClick={() => inviteStudent(record.githubId)}>Want to interview</a>,
          },
        ]}
      />
    </PageLayout>
  );
}

export default withCourseData(withSession(Page));
