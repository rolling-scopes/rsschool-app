import {
  MessageOutlined,
  MessageTwoTone,
  InteractionTwoTone,
  StarOutlined,
  LockFilled,
  TrophyOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Empty, Row, Statistic, Typography } from 'antd';
import { GithubUserLink } from '@client/shared/components/GithubUserLink';
import { PageLayoutSimple } from '@client/shared/components/PageLayout';
import { getMentorId } from '@client/domain/user';
import { SessionContext, useActiveCourseContext } from '@client/modules/Course/contexts';
import { useMentorStudents } from '@client/modules/Mentor/hooks/useMentorStudents';
import Link from 'next/link';
import { useContext } from 'react';
import * as routes from '@client/services/routes';
import { urlToString } from '@client/services/routes';

export function Students() {
  const session = useContext(SessionContext);
  const { course } = useActiveCourseContext();
  const { id: courseId, alias, completed } = course;
  const mentorId = getMentorId(session, courseId);

  const { students, loading } = useMentorStudents(mentorId);

  return (
    <PageLayoutSimple title="Your students" loading={loading}>
      {students?.length ? (
        students.map(student => {
          const [feedback] = student.feedbacks;
          return (
            <Card
              key={student.githubId}
              style={{ marginBottom: 32 }}
              styles={{ header: { border: 'none', paddingTop: 12 }}}
              size="small"
              className='antd-card_action_button_with_icon-fix'
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
                <Button
                  key="feedback"
                  href={urlToString(routes.getStudentFeedbackRoute(alias, student.id))}
                  type="link"
                  icon={completed ? <MessageTwoTone twoToneColor="red" /> : <MessageOutlined />}
                >
                  {feedback ? `Edit Feedback` : `Give Feedback`}
                </Button>,
                student.active ? (
                  <Button
                    key="expel"
                    href={urlToString(routes.getExpelRoute(alias))}
                    type="link"
                    icon={<InteractionTwoTone twoToneColor="orange" />}
                  >
                    Change Status
                  </Button>
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
                    styles={{ content: { fontSize: 16 } }}
                    title="Rank"
                    value={student.rank}
                    prefix={<TrophyOutlined />}
                  />
                </Col>
                <Col flex={8}>
                  <Statistic
                    styles={{ content: { fontSize: 16 } }}
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

