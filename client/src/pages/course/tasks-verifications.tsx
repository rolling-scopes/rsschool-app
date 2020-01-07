import { Table } from 'antd';
import { withSession, PageLayout } from 'components';
import withCourseData from 'components/withCourseData';
import { dateTimeRenderer } from 'components/Table/renderers';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';

function Page(props: CoursePageProps) {
  const courseId = props.course.id;
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([] as any[]);

  useAsync(async () => {
    try {
      setLoading(true);
      const data = await courseService.getTaskVerifications();
      setData(data);
    } catch {
      setLoading(false);
    }
  }, [courseId]);

  return (
    <PageLayout
      loading={loading}
      title="Tasks Verifications"
      courseName={props.course.name}
      githubId={props.session.githubId}
    >
      <Table
        size="small"
        pagination={{ pageSize: 100 }}
        bordered
        columns={[
          {
            title: 'Date/Time',
            dataIndex: 'createdDate',
            render: dateTimeRenderer,
            width: 200,
          },
          {
            title: 'Task Name',
            dataIndex: 'courseTask.task.name',
            width: 300,
          },
          {
            title: 'Score',
            dataIndex: 'score',
            width: 100,
          },
          {
            title: 'Details',
            dataIndex: 'details',
          },
        ]}
        dataSource={data}
      />
    </PageLayout>
  );
}

export default withCourseData(withSession(Page));
