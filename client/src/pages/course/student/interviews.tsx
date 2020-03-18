import { Card, message, Row, Col, Button, Modal } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { PageLayout, GithubUserLink } from 'components';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, Interview } from 'services/course';
import { CoursePageProps } from 'services/models';
import { formatDate } from 'services/formatter';

function Page(props: CoursePageProps) {
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const [data, setData] = useState([] as any[]);
  const [interviews, setInterviews] = useState([] as Interview[]);
  const [hasStageInterview, setStageInterview] = useState(false);
  const [loading, setLoading] = useState(false);

  useAsync(async () => {
    try {
      setLoading(true);
      const [data, interviews, stageInterview] = await Promise.all([
        courseService.getStudentInterviews(props.session.githubId),
        courseService.getInterviews(),
        courseService.getInterviewStudent(props.session.githubId).catch(() => null),
      ] as const);
      setData(data);
      setInterviews(interviews);
      setStageInterview(!!stageInterview);
    } catch {
      message.error('An error occurred. Please try later.');
    } finally {
      setLoading(false);
    }
  }, [props.course.id]);

  const handleRegister = async () => {
    Modal.confirm({
      title: 'Are you ready to participate in Stage Interview?',
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
        await courseService.createInterviewStudent(props.session.githubId);
        setStageInterview(true);
      },
    });
  };

  const renderRegisterButton = (interview: Interview) => {
    if (interview.type !== 'stage-interview') {
      return null;
    }
    return (
      <Button
        onClick={handleRegister}
        icon={hasStageInterview ? <CheckCircleOutlined /> : null}
        disabled={hasStageInterview}
        type={hasStageInterview ? 'default' : 'primary'}
      >
        {hasStageInterview ? 'Registered' : 'Register'}
      </Button>
    );
  };

  return (
    <PageLayout loading={loading} title="Interviews" githubId={props.session.githubId} courseName={props.course.name}>
      <Row gutter={24}>
        {interviews.map(interview => {
          const studentInterview = data.find(d => d.id === interview.id);
          return (
            <Col key={interview.id} xs={20} sm={16} md={12} lg={8} xl={8}>
              <Card size="small" title={interview.name} extra={renderRegisterButton(interview)}>
                <div>Start Date: {formatDate(interview.startDate)}</div>
                <div>
                  Description: <a href={interview.descriptionUrl}>Link</a>
                </div>
                {studentInterview && (
                  <div>
                    Interviewer: <GithubUserLink value={studentInterview.interviewer.githubId} />
                  </div>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </PageLayout>
  );
}

export default withCourseData(withSession(Page));
