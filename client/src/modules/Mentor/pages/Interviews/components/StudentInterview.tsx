import { Col, Row, Button, Typography, Space, Popconfirm } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';
import GithubFilled from '@ant-design/icons/GithubFilled';
import { DecisionTag, getInterviewFeedbackUrl, InterviewStatus } from 'domain/interview';
import { CourseService, MentorInterview } from 'services/course';
import { useState } from 'react';
import styles from './StudentInterview.module.css';
import { CloseCircleOutlined } from '@ant-design/icons';
import { TaskDtoTypeEnum } from 'api';
import { useMessage } from 'hooks';

export function StudentInterview(props: {
  interview: MentorInterview;
  interviewTaskType: TaskDtoTypeEnum;
  template?: string | null;
  courseAlias: string;
  courseId: number;
}) {
  const { message } = useMessage();
  const { interview, interviewTaskType, template, courseAlias, courseId } = props;
  const { student, completed } = interview;

  const [isInterviewCompleted, setInterviewCompleted] = useState(completed);
  const [popconfirmOpen, setPopconfirmOpen] = useState(false);

  const courseService = new CourseService(courseId);
  const isCoreJsInterview = interviewTaskType === TaskDtoTypeEnum.Interview;
  const interviewStatus = isInterviewCompleted ? InterviewStatus.Completed : interview.status;

  const interviewFeedbackUrl = getInterviewFeedbackUrl({
    courseAlias,
    interviewName: interview.name,
    interviewId: interview.id,
    studentGithubId: student.githubId,
    studentId: student.id,
    template: template,
  });

  const handleButtonClick = () => {
    if (!isInterviewCompleted && isCoreJsInterview) {
      setPopconfirmOpen(true);
    } else {
      window.location.href = interviewFeedbackUrl;
    }
  };

  const popconfirmTitle = (
    <div style={{ maxWidth: '270px', whiteSpace: 'pre-line' }}>
      You can reject the interview with a result <strong>0</strong>, if student didn't connect with you, or for other
      reasons.
    </div>
  );

  const handlePopconfirmConfirm = async () => {
    setPopconfirmOpen(false);
    const score = 0;
    const data = { score, comment: 'No Interview, Rejected' };
    await courseService.postStudentInterviewResult(student.githubId, interview.id, data);

    setInterviewCompleted(true);
    message.success('You feedback with zero result has been submitted.');
  };

  const handleCancel = () => {
    window.location.href = interviewFeedbackUrl;
    setPopconfirmOpen(false);
  };

  return (
    <Col className={styles.container}>
      <Space size={21} direction="vertical" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <DecisionTag decision={interview.decision} status={interviewStatus} />
          <Popconfirm
            title={popconfirmTitle}
            open={isCoreJsInterview && !isInterviewCompleted && popconfirmOpen}
            onOpenChange={visible => setPopconfirmOpen(visible)}
            onConfirm={handlePopconfirmConfirm}
            onCancel={handleCancel}
            okText="Reject"
            cancelText="Provide feedback"
            okButtonProps={{
              danger: true,
              icon: <CloseCircleOutlined />,
            }}
          >
            <Button type="primary" ghost size="small" onClick={handleButtonClick}>
              {isInterviewCompleted ? 'Edit feedback' : 'Provide feedback'}
            </Button>
          </Popconfirm>
        </Row>
        <Row>
          <Space size={14} align="baseline">
            <GithubAvatar githubId={student.githubId} size={24} />
            <Col>
              <Typography.Title level={5}>
                <Typography.Link target="_blank" href={`/profile?githubId=${student.githubId}`}>
                  {student.name || student.githubId}
                </Typography.Link>
              </Typography.Title>
            </Col>
            <Col>
              <Typography.Link target="_blank" href={`https://github.com/${student.githubId}`}>
                <GithubFilled />
              </Typography.Link>
            </Col>
          </Space>
        </Row>
      </Space>
    </Col>
  );
}
