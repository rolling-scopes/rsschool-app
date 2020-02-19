import { Table, Typography, message } from 'antd';
import { PageLayout, GithubUserLink } from 'components';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';
import { boolIconRenderer, dateRenderer } from 'components/Table';

function Page(props: CoursePageProps) {
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const [data, setData] = useState([] as any[]);
  const [loading, setLoading] = useState(false);

  useAsync(async () => {
    try {
      setLoading(true);
      const data = await courseService.getStudentInterviews(props.session.githubId);
      setData(data);
    } catch {
      message.error('An error occurred. Please try later.');
    } finally {
      setLoading(false);
    }
  }, [props.course.id]);

  return (
    <PageLayout loading={loading} title="Interviews" githubId={props.session.githubId} courseName={props.course.name}>
      <Table
        dataSource={data}
        pagination={false}
        rowKey="name"
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
          },
          {
            title: 'Deadline',
            dataIndex: 'endDate',
            render: (value: string, record: any) =>
              value && !record.completed ? (
                <Typography.Text type="danger">{dateRenderer(value)}</Typography.Text>
              ) : (
                dateRenderer(value)
              ),
          },
          {
            title: 'Completed',
            dataIndex: 'completed',
            render: boolIconRenderer,
            width: 50,
          },
          {
            title: 'Interviewer',
            dataIndex: ['interviewer', 'githubId'],
            render: value => <GithubUserLink value={value} />,
          },
          {
            title: 'Interviewer Contacts',
            dataIndex: ['interviewer'],
            render: value => {
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
