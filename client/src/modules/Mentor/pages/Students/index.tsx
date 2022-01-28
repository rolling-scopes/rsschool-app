import { MessageOutlined, MessageTwoTone, MinusCircleTwoTone, StarOutlined, TrophyOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Row, Statistic } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';
import { PageLayoutSimple } from 'components/PageLayout';
import { getMentorId } from 'domain/user';
import { SessionContext } from 'modules/Course/contexts';
import { useMentorStudents } from 'modules/Mentor/hooks/useMentorStudents';
import Link from 'next/link';
import { useContext } from 'react';
import type { CourseOnlyPageProps } from 'services/models';
import * as routes from 'services/routes';

export function Students(props: CourseOnlyPageProps) {
  const session = useContext(SessionContext);
  const { githubId } = session;
  const { id: courseId, alias, completed } = props.course;
  const mentorId = getMentorId(session, courseId);

  const [students, loading] = useMentorStudents(mentorId);

  return (
    <PageLayoutSimple title="Your students" loading={loading} githubId={githubId}>
      {students?.length ? (
        students.map(student => {
          const [feedback] = student.feedbacks;
          return (
            <Card
              size="small"
              title={
                <>
                  <GithubAvatar size={24} githubId={student.githubId} />
                  <span style={{ marginLeft: 16 }}>
                    {student.name} ({student.githubId})
                  </span>
                </>
              }
              actions={
                feedback
                  ? []
                  : [
                      <Link href={routes.getStudentFeedbackRoute(alias, student.id)}>
                        <Button
                          type="link"
                          icon={completed ? <MessageTwoTone twoToneColor="red" /> : <MessageOutlined />}
                        >
                          {feedback ? `Edit Feedback` : `Give Feedback`}
                        </Button>
                      </Link>,
                      <Link href={routes.getExpelRoute(alias)}>
                        <Button type="link" icon={<MinusCircleTwoTone twoToneColor="red" />}>
                          Expel
                        </Button>
                      </Link>,
                    ]
              }
              extra={`${student.cityName}, ${student.countryName}`}
            >
              <Row gutter={16}>
                <Col flex={8}>
                  <Statistic title="Rank" value={student.rank} prefix={<TrophyOutlined />} />
                </Col>
                <Col flex={8}>
                  <Statistic title="Score" value={student.totalScore} prefix={<StarOutlined />} />
                </Col>
              </Row>
            </Card>
          );
        })
      ) : (
        <div style={{ marginTop: 64 }}>
          <Empty description={<span className="ant-empty-normal">You do not have students</span>} />
        </div>
      )}
    </PageLayoutSimple>
  );
}
