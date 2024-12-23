import { message, Card, Row, List, Col, Button, Modal, Tag, Descriptions } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { GithubUserLink } from 'components/GithubUserLink';
import { PageLayout } from 'components/PageLayout';
import { useMemo, useState, useContext } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { formatShortDate } from 'services/formatter';
import { getInterviewResult, InterviewDetails, InterviewStatus, stageInterviewType } from 'domain/interview';
import { Decision } from 'data/interviews/technical-screening';
import { ActiveCourseProvider, SessionContext, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { CoursesInterviewsApi, InterviewDto } from 'api';

const coursesInterviewApi = new CoursesInterviewsApi();

function StudentInterviewPage() {
  const session = useContext(SessionContext);
  const { course } = useActiveCourseContext();
  const courseService = useMemo(() => new CourseService(course.id), [course.id]);
  const [data, setData] = useState<InterviewDetails[]>([]);
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [registeredInterviews, setRegisteredInterviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useAsync(async () => {
    try {
      setLoading(true);
      const [data, { data: interviews }] = await Promise.all([
        courseService.getStudentInterviews(session.githubId),
        coursesInterviewApi.getInterviews(course.id),
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
  }, [course.id]);

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
        try {
          await coursesInterviewApi.registerToInterview(course.id, Number(interviewId));
          setRegisteredInterviews(registeredInterviews.concat([interviewId]));
        } catch {
          message.error('An error occurred. Please try later.');
        }
      },
    });
  };

  const getRegisteredInterviews = async (interviews: InterviewDto[]) => {
    const requests = interviews
      .map(({ type, id }) => (type === stageInterviewType ? 'stage' : id.toString()))
      .map(async id => {
        const data = await courseService.getInterviewStudent(session.githubId, id).catch(() => null);
        return data ? id : null;
      });

    const result = await Promise.all(requests);
    return result.filter(id => id != null) as string[];
  };

  const renderExtra = (interview: InterviewDto) => {
    const id = interview.type === stageInterviewType ? 'stage' : interview.id.toString();
    const hasInterview = registeredInterviews.includes(id);
    return interview.studentRegistrationStartDate && new Date() < new Date(interview.studentRegistrationStartDate) ? (
      <Tag color="orange">Registration starts at {formatShortDate(interview.studentRegistrationStartDate)}</Tag>
    ) : (
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
    <PageLayout loading={loading} title="Interviews" background="#F0F2F5" showCourseName>
      <Row gutter={24} style={{ minHeight: '85vh' }}>
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
                            <b>{getInterviewResult(item.result as Decision) ?? '-'}</b>
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

export default function () {
  return (
    <SessionProvider>
      <ActiveCourseProvider>
        <StudentInterviewPage />
      </ActiveCourseProvider>
    </SessionProvider>
  );
}
