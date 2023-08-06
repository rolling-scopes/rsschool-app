import { Col, Tag, Row, Button, Typography, Space } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';
import GithubFilled from '@ant-design/icons/GithubFilled';
import { getInterviewFeedbackUrl } from 'domain/interview';
import { MentorInterview } from 'services/course';
import css from 'styled-jsx/css';

export function StudentInterview(props: {
  interview: MentorInterview;
  template?: string | null;
  courseAlias: string;
  interviewTaskId: number;
}) {
  const { interview, template, courseAlias, interviewTaskId } = props;
  const { student, completed } = interview;
  return (
    <Col className={containerClassName}>
      <Space size={21} direction="vertical" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Tag color={interview.completed ? 'green' : undefined}>
            {interview.completed ? 'Completed' : 'Uncompleted'}
          </Tag>
          <Button
            type="primary"
            ghost
            size="small"
            href={getInterviewFeedbackUrl({
              courseAlias,
              interviewName: interview.name,
              interviewId: interview.id,
              studentGithubId: student.githubId,
              studentId: student.id,
              template: template,
              interviewTaskId,
            })}
          >
            {completed ? 'Edit feedback' : 'Provide feedback'}
          </Button>
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
      {containerStyles}
    </Col>
  );
}

const { className: containerClassName, styles: containerStyles } = css.resolve`
  div {
    border: 1px solid rgba(245, 245, 245, 1);
    padding: 16px;
  }
  div + div {
    border-top: none;
  }

  div:first-child {
    margin-top: 15px;
  }
`;
