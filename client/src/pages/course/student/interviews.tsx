import { message, Card, Row, Spin, List, Col, Button, Modal, Tag, Descriptions, Typography, Alert } from 'antd';
import { CheckCircleOutlined, InfoCircleTwoTone } from '@ant-design/icons';
import { GithubUserLink } from 'components/GithubUserLink';
import { PageLayout } from 'components/PageLayout';
import { useMemo, useState, useContext } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { formatShortDate } from 'services/formatter';
import { getInterviewResult, InterviewDetails, InterviewStatus } from 'domain/interview';
import { Decision } from 'data/interviews/technical-screening';
import { ActiveCourseProvider, SessionContext, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { CoursesInterviewsApi, InterviewDto, TaskDtoTypeEnum } from 'api';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';

const { Meta } = Card;

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
        coursesInterviewApi.getInterviews(course.id, false, [
          TaskDtoTypeEnum.Interview,
          TaskDtoTypeEnum.StageInterview,
        ]),
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

  const getInterviewId = (type: string, id: number): string => {
    return type === TaskDtoTypeEnum.StageInterview ? 'stage' : id.toString();
  };

  const getRegisteredInterviews = async (interviews: InterviewDto[]) => {
    const requests = interviews
      .map(({ type, id }) => (type === TaskDtoTypeEnum.StageInterview ? 'stage' : id.toString()))
      .map(async id => {
        const data = await courseService.getInterviewStudent(session.githubId, id).catch(() => null);
        return data ? id : null;
      });

    const result = await Promise.all(requests);
    return result.filter(id => id != null) as string[];
  };

  const hasInterview = (type: string, id: number): boolean => {
    const interviewId = getInterviewId(type, id);
    return registeredInterviews.includes(interviewId);
  };

  const isRegistrationNotStarted = (interview: InterviewDto): boolean => {
    return !!interview.studentRegistrationStartDate && new Date() < new Date(interview.studentRegistrationStartDate);
  };

  const renderExtra = (interview: InterviewDto) => {
    const { type, id, studentRegistrationStartDate } = interview;
    const isRegistered = hasInterview(type, id);
    const interviewId = getInterviewId(type, id);

    if (isRegistrationNotStarted(interview)) {
      return <Tag color="orange">Registration starts on {formatShortDate(studentRegistrationStartDate)}</Tag>;
    }

    return (
      <Button
        onClick={() => handleRegister(interviewId)}
        icon={isRegistered ? <CheckCircleOutlined /> : null}
        disabled={isRegistered}
        type={isRegistered ? 'default' : 'primary'}
      >
        {isRegistered ? 'Registered' : 'Register'}
      </Button>
    );
  };

  const renderNoInterviews = () => (
    <Row justify="center">
      <Col xs={24} lg={12}>
        <Alert
          description={<div className="icon-group" />}
          icon={<InfoCircleTwoTone />}
          showIcon
          message="There are no planned interviews."
          type="info"
        />
      </Col>
    </Row>
  );

  const renderInterviewCard = (interview: InterviewDto) => {
    const isRegistered = hasInterview(interview.type, interview.id);
    const registrationNotStarted = isRegistrationNotStarted(interview);
    const items = data.filter(d => d.name === interview.name);
    const hasInterviewer = items.some(i => i.interviewer.githubId != null);
    const interviewPassed = items.length > 0 && items.every(i => i.result != null);
    const { name, startDate, endDate, id, descriptionUrl, studentRegistrationStartDate } = interview;

    return (
      <Col key={id} xs={24} lg={12}>
        <Card
          bodyStyle={{ paddingTop: 0 }}
          hoverable
          title={
            <Button type="link" href={descriptionUrl} target="_blank" style={{ padding: 0, fontWeight: 500 }}>
              {name}
            </Button>
          }
          extra={<InterviewPeriod startDate={startDate} endDate={endDate} />}
        >
          <Meta
            style={{ minHeight: 82, alignItems: 'center', textAlign: 'center' }}
            description={hasInterviewer ? renderInterviewResult(items) : renderExtra(interview)}
          />

          <Alert
            message={
              <div style={{ minHeight: 50 }}>
                {renderCardMessage(interviewPassed, isRegistered, registrationNotStarted, studentRegistrationStartDate)}
              </div>
            }
            icon={<InfoCircleTwoTone />}
            showIcon
            type="info"
            description={renderCardDescription(items, registrationNotStarted, isRegistered)}
            style={{ minHeight: 275 }}
          />
        </Card>
      </Col>
    );
  };

  const renderCardMessage = (
    interviewPassed: boolean,
    isRegistered: boolean,
    registrationNotStarted: boolean,
    registrationStartDate: string,
  ) => {
    switch (true) {
      case interviewPassed:
        return 'You have your interview result. Congratulations!';
      case isRegistered:
        return 'You’re all set! Prepare for your upcoming interview.';
      case registrationNotStarted:
        return (
          <div>
            Remember to come back and register after{' '}
            <span style={{ whiteSpace: 'nowrap' }}>{formatShortDate(registrationStartDate)}</span>!
          </div>
        );
      default:
        return 'Register and get ready for your exciting interview!';
    }
  };

  const getIconClass = (interviewPassed: boolean, registrationNotStarted: boolean, isRegistered: boolean) => {
    switch (true) {
      case interviewPassed:
        return 'passed';
      case isRegistered:
        return 'registered';
      case registrationNotStarted:
        return 'registration-not-started';
      case !isRegistered:
        return 'not-registered';
      default:
        return 'not-registered';
    }
  };

  const renderCardDescription = (items: InterviewDetails[], registrationNotStarted: boolean, isRegistered: boolean) => {
    const interviewPassed = items.length > 0 && items.every(i => i.result != null);
    const iconClass = getIconClass(interviewPassed, registrationNotStarted, isRegistered);

    return <div className={`icon-group ${iconClass}`} />;
  };

  const renderInterviewResult = (items: InterviewDetails[]) => {
    return (
      <List
        itemLayout="vertical"
        dataSource={items}
        size="small"
        renderItem={item => {
          const { interviewer, status, result } = item;
          return (
            <List.Item style={{ padding: '8px 0' }}>
              <Descriptions layout="vertical" size="small">
                <Descriptions.Item label="Interviewer">
                  <GithubUserLink value={interviewer.githubId} />
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <StatusLabel status={status} />
                </Descriptions.Item>
                <Descriptions.Item label="Result">
                  <b>{getInterviewResult(result as Decision) ?? '-'}</b>
                </Descriptions.Item>
              </Descriptions>
            </List.Item>
          );
        }}
      />
    );
  };

  const renderInterviewsList = () => {
    return interviews.map(interview => renderInterviewCard(interview));
  };

  return (
    <PageLayout loading={loading} title="Interviews" background="#F0F2F5" showCourseName>
      <Spin spinning={loading}>
        {interviews.length === 0 ? (
          renderNoInterviews()
        ) : (
          <Row gutter={[12, 12]} justify="start">
            {renderInterviewsList()}
          </Row>
        )}
      </Spin>
      <style jsx global>{`
        .icon-group {
          background-image: url(/static/svg/sloths/lazy.svg);
          background-position: center;
          background-size: contain;
          background-repeat: no-repeat;
          max-width: 270px;
          height: 160px;
          margin: 10px auto;
        }
        .registration-not-started {
          background-image: url(/static/svg/sloths/listening.svg);
        }
        .not-registered {
          background-image: url(/static/svg/sloths/take-notes.svg);
        }
        .registered {
          background-image: url(/static/svg/sloths/its-a-good-job.svg);
        }
        .passed {
          background-image: url(/static/svg/sloths/congratulations.svg);
        }
      `}</style>
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

function InterviewPeriod(props: { startDate: string; endDate: string }) {
  const { startDate, endDate } = props;
  return (
    <Typography.Text type="secondary">
      <CalendarOutlined style={{ marginRight: 8 }} />
      {`${formatShortDate(startDate)} - ${formatShortDate(endDate)}`}
    </Typography.Text>
  );
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
