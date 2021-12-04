import { message, Card, Row, List, Col, Button, Modal, Tag, Descriptions } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { GithubUserLink } from 'components/GithubUserLink';
import { PageLayout } from 'components/PageLayout';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, Interview } from 'services/course';
import { CoursePageProps } from 'services/models';
import { formatShortDate } from 'services/formatter';
import { friendlyStageInterviewVerdict, InterviewDetails, InterviewStatus } from 'domain/interview';

function Page(props: CoursePageProps) {
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const [data, setData] = useState<InterviewDetails[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [registeredInterviews, setRegisteredInterviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useAsync(async () => {
    try {
      setLoading(true);
      const [data, interviews] = await Promise.all([
        courseService.getStudentInterviews(props.session.githubId),
        courseService.getInterviews(),
      ] as const);
      const registeredInterviews = await getRegisteredInterviews(interviews);

      setData(data);
      setInterviews(interviews);
      setRegisteredInterviews(registeredInterviews);
    } catch {
      message.error('An error occurred. Please try later.');
    } finally {
      setLoading(false);
    }
  }, [props.course.id]);

  const handleRegister = async (interviewId: string) => {
    Modal.confirm({
      title: 'Are you ready to participate in the interview?',
      content: (
        <>
          You are committing to do the following:
          <ul>
            <li>Contact assigned interviewer in time</li>
            <li>Participate in the interview</li>
          </ul>
          NOTE: We DO NOT GUARANTEE you will get an interviewer. It depends on your score and how many mentors will be
          available.
        </>
      ),
      okText: 'Yes',
      onOk: async () => {
        await courseService.createInterviewStudent(props.session.githubId, interviewId);
        setRegisteredInterviews(registeredInterviews.concat([interviewId]));
      },
    });
  };

  const getRegisteredInterviews = async (interviews: Interview[]) => {
    const requests = interviews
      .map(({ type, id }) => (type === 'stage-interview' ? 'stage' : id))
      .map(async id => {
        const data = await courseService.getInterviewStudent(props.session.githubId, id).catch(() => null);
        return data ? id : null;
      });

    const result = await Promise.all(requests);
    return result.filter(id => id != null) as string[];
  };

  const renderExtra = (interview: Interview) => {
    const id = interview.type === 'stage-interview' ? 'stage' : interview.id;
    const hasInterview = registeredInterviews.includes(id);
    return (
      <Button
        onClick={() => handleRegister(id)}
        icon={hasInterview ? <CheckCircleOutlined /> : null}
        disabled={hasInterview}
        type={hasInterview ? 'default' : 'primary'}
      >
        {hasInterview ? 'Registered' : 'Register'}
      </Button>
    );
  };

  return (
    <PageLayout loading={loading} title="Interviews" githubId={props.session.githubId} courseName={props.course.name}>
      <Row gutter={24}>
        {interviews.map(interview => {
          const items = data.filter(d => d.name === interview.name);
          return (
            <Col key={interview.id} xs={20} sm={16} md={14} lg={12} xl={10} xxl={10}>
              <Card
                size="small"
                title={
                  <>
                    <Button target="_blank" href={interview.descriptionUrl} type="link">
                      {interview.name}
                    </Button>
                    {formatShortDate(interview.startDate)} - {formatShortDate(interview.endDate)}
                  </>
                }
                extra={renderExtra(interview)}
              >
                <List
                  itemLayout="vertical"
                  dataSource={items}
                  size="small"
                  renderItem={item => {
                    return (
                      <List.Item style={{ padding: '8px 0' }}>
                        <Descriptions layout="vertical" size="small">
                          <Descriptions.Item label="Interviewer">
                            <GithubUserLink value={item.interviewer.githubId} />
                          </Descriptions.Item>
                          <Descriptions.Item label="Status">
                            <StatusLabel status={item.status} />
                          </Descriptions.Item>
                          <Descriptions.Item label="Result">
                            <b>{friendlyStageInterviewVerdict(item.result as any) ?? '-'}</b>
                          </Descriptions.Item>
                        </Descriptions>
                      </List.Item>
                    );
                  }}
                ></List>
              </Card>
            </Col>
          );
        })}
      </Row>
    </PageLayout>
  );
}

function StatusLabel({ status }: { status: InterviewStatus }) {
  switch (status) {
    case InterviewStatus.Completed:
      return <Tag color="green">Completed</Tag>;
    case InterviewStatus.Canceled:
      return <Tag color="red">Canceled</Tag>;
    case InterviewStatus.NotCompleted:
    default:
      return <Tag color="orange">Not Completed</Tag>;
  }
}

export default withCourseData(withSession(Page));
