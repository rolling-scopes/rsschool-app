import { Table } from 'antd';
import { PageLayout, withSession, Rating } from 'components';
import {
  getColumnSearchProps,
  numberSorter,
  stringSorter,
  boolSorter,
  boolIconRenderer,
  PersonCell,
} from 'components/Table';
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
            render: (_: string, record: any) => <PersonCell value={record} />,
            ...getColumnSearchProps(['githubId', 'name']),
          },
          {
            title: 'Good Candidate',
            dataIndex: 'isGoodCandidate',
            width: 180,
            sorter: boolSorter('isGoodCandidate'),
            render: (value) => (value ? boolIconRenderer(value) : null),
          },
          {
            title: 'Interview Rating',
            dataIndex: 'rating',
            sorter: numberSorter('rating'),
            width: 210,
            render: (value) => (value != null ? <Rating rating={value} /> : null),
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
