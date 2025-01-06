import { message, Card, Row, Spin, Col, Button, Modal, Tag, Descriptions, Alert } from 'antd';
import { CheckCircleOutlined, InfoCircleTwoTone } from '@ant-design/icons';
import { GithubUserLink } from 'components/GithubUserLink';
import { PageLayout } from 'components/PageLayout';
import { useMemo, useState, useContext } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { formatShortDate } from 'services/formatter';
import { getInterviewResult, InterviewDetails, InterviewPeriod, InterviewStatus } from 'domain/interview';
import { Decision } from 'data/interviews/technical-screening';
import { ActiveCourseProvider, SessionContext, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { CoursesInterviewsApi, InterviewDto, TaskDtoTypeEnum } from 'api';
import css from 'styled-jsx/css';

const coursesInterviewApi = new CoursesInterviewsApi();
const { Meta } = Card;

interface StudentInterviewDetails {
  registrationNotStarted: boolean;
  registrationStart?: string;
  isRegistered: boolean;
  interviewPassed: boolean;
}

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

  const getRegisteredInterviews = async (interviews: InterviewDto[]) => {
    try {
      const requests = interviews.map(async ({ id }) => {
        const data = await courseService.getInterviewStudent(session.githubId, id.toString()).catch(() => null);
        return data ? id.toString() : null;
      });

      const result = await Promise.all(requests);
      return result.filter(id => id != null);
    } catch (error) {
      message.error('Something went wrong, please try reloading the page later');
      return [];
    }
  };

  const hasInterview = (id: number): boolean => {
    return registeredInterviews.includes(id.toString());
  };

  const isRegistrationNotStarted = (interview: InterviewDto): boolean => {
    return !!interview.studentRegistrationStartDate && new Date() < new Date(interview.studentRegistrationStartDate);
  };

  const renderExtra = (interview: InterviewDto) => {
    const { id, studentRegistrationStartDate } = interview;
    const isRegistered = hasInterview(id);

    return isRegistrationNotStarted(interview) ? (
      <Tag color="orange">Registration starts on {formatShortDate(studentRegistrationStartDate)}</Tag>
    ) : (
      <Button
        onClick={() => handleRegister(id.toString())}
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
          type="info"
          showIcon
          icon={<InfoCircleTwoTone />}
          message="There are no planned interviews."
          description={
            <>
              <div className={iconGroup.className} />
              {iconGroup.styles}
            </>
          }
        />
      </Col>
    </Row>
  );

  const renderInterviewCard = (interview: InterviewDto) => {
    const { name, startDate, endDate, id, descriptionUrl, studentRegistrationStartDate: registrationStart } = interview;
    const item = data.find(d => d.name === name);

    const isRegistered = hasInterview(interview.id);
    const registrationNotStarted = isRegistrationNotStarted(interview);

    const hasInterviewer = item?.status === InterviewStatus.NotCompleted;
    const interviewPassed = item?.status === InterviewStatus.Completed;

    const metaDescription = hasInterviewer || interviewPassed ? renderInterviewDetails(item) : renderExtra(interview);
    const alertDescription = renderCardDescription({ interviewPassed, isRegistered, registrationNotStarted });
    const { cardMessage } = getInterviewCardDetails({
      interviewPassed,
      isRegistered,
      registrationNotStarted,
      registrationStart,
    });

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
          extra={<InterviewPeriod startDate={startDate} endDate={endDate} shortDate />}
        >
          <Meta style={{ minHeight: 80, alignItems: 'center', textAlign: 'center' }} description={metaDescription} />

          <Alert
            message={<div style={{ minHeight: 50 }}>{cardMessage}</div>}
            icon={<InfoCircleTwoTone />}
            showIcon
            type="info"
            description={alertDescription}
            style={{ minHeight: 275 }}
          />
        </Card>
      </Col>
    );
  };

  const getInterviewCardDetails = (params: StudentInterviewDetails) => {
    const { interviewPassed, isRegistered, registrationNotStarted, registrationStart } = params;

    if (interviewPassed) {
      return {
        cardMessage: 'You have your interview result. Congratulations!',
        backgroundImage: 'url(https://cdn.rs.school/sloths/cleaned/congratulations.svg)',
      };
    }

    if (isRegistered) {
      return {
        cardMessage: 'You’re all set! Prepare for your upcoming interview.',
        backgroundImage: 'url(https://cdn.rs.school/sloths/cleaned/its-a-good-job.svg)',
      };
    }

    if (registrationNotStarted) {
      return {
        cardMessage: (
          <div>
            Remember to come back and register after{' '}
            <span style={{ whiteSpace: 'nowrap' }}>{formatShortDate(registrationStart ?? '')}</span>!
          </div>
        ),
        backgroundImage: 'url(https://cdn.rs.school/sloths/cleaned/listening.svg)',
      };
    }

    return {
      cardMessage: 'Register and get ready for your exciting interview!',
      backgroundImage: 'url(https://cdn.rs.school/sloths/cleaned/take-notes.svg)',
    };
  };

  const renderCardDescription = (params: StudentInterviewDetails) => {
    const { backgroundImage } = getInterviewCardDetails(params);
    return (
      <>
        <div className={iconGroup.className} style={{ backgroundImage }} />
        {iconGroup.styles}
      </>
    );
  };

  const renderInterviewDetails = (item: InterviewDetails) => {
    const { interviewer, status, result } = item;

    return (
      <div style={{ padding: '8px 0' }}>
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
      </div>
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
    </PageLayout>
  );
}

const iconGroup = css.resolve`
  div {
    background-image: url(https://cdn.rs.school/sloths/cleaned/lazy.svg);
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    max-width: 270px;
    height: 160px;
    margin: 10px auto;
  }
`;

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
