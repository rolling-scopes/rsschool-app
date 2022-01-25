import { MessageOutlined, MessageTwoTone } from '@ant-design/icons';
import { Button, List } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';
import { PageLayoutSimple } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { useMentorStudents } from 'modules/Mentor/hooks/useMentorStudents';
import Link from 'next/link';
import { useContext } from 'react';
import type { CourseOnlyPageProps } from 'services/models';

export function Students(props: CourseOnlyPageProps) {
  const session = useContext(SessionContext);
  const { githubId } = session;
  const { id: courseId, alias, completed } = props.course;
  const mentorId = session.courses[courseId]?.mentorId;

  const [students, loading] = useMentorStudents(mentorId);

  return (
    <PageLayoutSimple title="Your students" loading={loading} githubId={githubId}>
      <List itemLayout="vertical">
        {students?.map(student => {
          const [feedback] = student.feedbacks;
          const id = feedback ? `/${feedback.id}` : '';
          const url = `/course/mentor/feedback${id}?course=${alias}&studentId=${student.id}`;
          return (
            <List.Item
              key={student.githubId}
              extra={
                <div>
                  <div>Rank: {student.rank}</div>
                  <div>Score: {student.totalScore}</div>
                </div>
              }
              actions={
                feedback
                  ? []
                  : [
                      <Link href={url}>
                        <Button
                          type="link"
                          icon={completed ? <MessageTwoTone twoToneColor="red" /> : <MessageOutlined />}
                        >
                          {feedback ? `Edit Feedback` : `Give Feedback`}
                        </Button>
                      </Link>,
                    ]
              }
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
