import { Table, Typography, message } from 'antd';
import { PageLayout, GithubUserLink } from 'components';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';

function Page(props: CoursePageProps) {
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const [data, setData] = useState([] as any[]);
  const [loading, setLoading] = useState(false);

  useAsync(async () => {
    try {
      setLoading(true);
      const data = await courseService.getStudentCrossMentors(props.session.githubId);
      setData(data);
    } catch {
      message.error('An error occurred. Please try later.');
    } finally {
      setLoading(false);
    }
  }, [props.course.id]);

  return (
    <PageLayout
      loading={loading}
      title="Cross Mentors"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      <Table
        dataSource={data}
        pagination={false}
        rowKey="name"
        columns={[
          {
            title: 'Task Name',
            dataIndex: 'name',
          },
          {
            title: 'Mentor',
            dataIndex: ['mentor', 'githubId'],
            render: (value) => <GithubUserLink value={value} />,
          },
          {
            title: 'Mentor Contacts',
            dataIndex: ['mentor'],
            render: (value) => {
              return (
                <ul>
                  {renderContact('Phone', value.contactsPhone)}
                  {renderContact('Email', value.primaryEmail)}
                  {renderContact('Telegram', value.contactsTelegram)}
                  {renderContact('Skype', value.contactsSkype)}
                  {renderContact('Notes', value.contactsNotes)}
                </ul>
              );
            },
          },
        ]}
      />
    </PageLayout>
  );
}

function renderContact(label: string, value: string) {
  if (value == null) {
    return null;
  }
  return (
    <li>
      <Typography.Text type="secondary">{label}:</Typography.Text> {value}
    </li>
  );
}

export default withCourseData(withSession(Page));
