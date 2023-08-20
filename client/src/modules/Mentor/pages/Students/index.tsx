import {
  MessageOutlined,
  MessageTwoTone,
  MinusCircleTwoTone,
  StarOutlined,
  LockFilled,
  TrophyOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Empty, Row, Statistic, Typography } from 'antd';
import { GithubUserLink } from 'components/GithubUserLink';
import { PageLayoutSimple } from 'components/PageLayout';
import { getMentorId } from 'domain/user';
import { DefaultPageContext } from 'modules/Course/contexts';
import { useMentorStudents } from 'modules/Mentor/hooks/useMentorStudents';
import Link from 'next/link';
import { useContext } from 'react';
import type { CourseOnlyPageProps } from 'services/models';
import * as routes from 'services/routes';

export function Students(props: CourseOnlyPageProps) {
  const { session } = useContext(DefaultPageContext);
  const { id: courseId, alias, completed } = props.course;
  const mentorId = getMentorId(session, courseId);

  const [students, loading] = useMentorStudents(mentorId);

  return (
    <PageLayoutSimple title="Your students" loading={loading}>
      {students?.length ? (
        students.map(student => {
          const [feedback] = student.feedbacks;
          return (
            <Card
              key={student.githubId}
              style={{ marginBottom: 32 }}
              headStyle={{ border: 'none', paddingTop: 12 }}
              size="small"
              title={
                <>
                  <div>
                    <GithubUserLink value={student.githubId} />
                  </div>
                  <Link href={`/profile?githubId=${student.githubId}`}>{student.name}</Link>
                  {student.repoUrl && (
                    <div>
                      <LockFilled />{' '}
                      <a href={student.repoUrl} target="_blank">
                        {student.repoUrl.split('/').pop()}
                      </a>
                    </div>
                  )}
                </>
              }
              actions={[
                !feedback ? (
                  <Link href={routes.getStudentFeedbackRoute(alias, student.id)} legacyBehavior>
                    <Button type="link" icon={completed ? <MessageTwoTone twoToneColor="red" /> : <MessageOutlined />}>
                      {feedback ? `Edit Feedback` : `Give Feedback`}
                    </Button>
                  </Link>
                ) : null,
                student.active ? (
                  <Link href={routes.getExpelRoute(alias)} legacyBehavior>
                    <Button type="link" icon={<MinusCircleTwoTone twoToneColor="red" />}>
                      Expel
                    </Button>
                  </Link>
                ) : null,
              ].filter(Boolean)}
              extra={
                <Typography.Text ellipsis style={{ maxWidth: 160 }}>
                  {student.cityName}, {student.countryName}
                </Typography.Text>
              }
            >
              <Row gutter={16}>
                <Col flex={8}>
                  <Statistic
                    valueStyle={{ fontSize: 16 }}
                    title="Rank"
                    value={student.rank}
                    prefix={<TrophyOutlined />}
                  />
                </Col>
                <Col flex={8}>
                  <Statistic
                    valueStyle={{ fontSize: 16 }}
                    title="Score"
                    value={student.totalScore}
                    prefix={<StarOutlined />}
                  />
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
