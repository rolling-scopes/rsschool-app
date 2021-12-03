import { MessageOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { Button, List } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';
import { PageLayoutSimple } from 'components/PageLayout';
import { useMentorStudents } from 'modules/Feedback/hooks/useMentorStudents';
import { CoursePageProps } from 'services/models';

export function StudentFeedbacks(props: CoursePageProps) {
  const { githubId } = props.session;
  const { id } = props.course;

  const [students, _, loading] = useMentorStudents(id);

  return (
    <PageLayoutSimple title="Your students" loading={loading} githubId={githubId}>
      <List itemLayout="vertical">
        {students.concat(students).map(student => {
          return (
            <List.Item
              key={student.githubId}
              extra={
                <div>
                  <div>Score: N/A</div>
                  <div>Rank: N/A</div>
                </div>
              }
              actions={[
                <Link href={`/student/${student.id}/feedback`}>
                  <Button type="text" icon={<MessageOutlined />}>
                    Feedback
                  </Button>
                </Link>,
              ]}
            >
              <List.Item.Meta
                avatar={<GithubAvatar size={24} githubId={student.githubId} />}
                title={`${student.name} (${student.githubId})`}
                description={`${student.cityName}, ${student.countryName}`}
              />
            </List.Item>
          );
        })}
      </List>
    </PageLayoutSimple>
  );
}
