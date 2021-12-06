import { MessageOutlined, MessageTwoTone } from '@ant-design/icons';
import { Button, List } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';
import { PageLayoutSimple } from 'components/PageLayout';
import { useLoading } from 'components/useLoading';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CoursePageProps } from 'services/models';
import { MentorsApi, MentorStudentDto } from 'api';

export function Students(props: CoursePageProps) {
  const { githubId } = props.session;
  const { id: courseId, alias, completed } = props.course;
  const mentorId = Number(props.session.courses[courseId].mentorId);
  const [loading, withLoading] = useLoading(false);
  const [students, setStudents] = useState<MentorStudentDto[]>([]);

  const service = useMemo(() => new MentorsApi(undefined, ''), []);
  useAsync(
    withLoading(async () => {
      const r = await service.getMentorStudents(mentorId);
      setStudents(r.data);
    }),
    [],
  );

  return (
    <PageLayoutSimple title="Your students" loading={loading} githubId={githubId}>
      <List itemLayout="vertical">
        {students.concat(students).map(student => {
          return (
            <List.Item
              key={student.githubId}
              extra={
                <div>
                  <div>Rank: {student.rank}</div>
                  <div>Score: {student.totalScore}</div>
                </div>
              }
              actions={[
                <Link href={`/course/mentor/feedback?course=${alias}&studentId=${student.id}`}>
                  <Button type="link" icon={completed ? <MessageTwoTone twoToneColor="red" /> : <MessageOutlined />}>
                    {student.hasFeedback ? `Edit Feedback` : `Give Feedback`}
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
