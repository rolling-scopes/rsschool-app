import { useMemo } from 'react';
import { ScoreIcon } from 'components/Icons/ScoreIcon';
import { Button, Col, Comment, Divider, Form, Input, message, Row, Typography } from 'antd';
import { MessageFilled } from '@ant-design/icons';
import { CourseService, SolutionReviewType, TaskSolutionResultRole } from 'services/course';
import { formatDateTime } from 'services/formatter';
import { SolutionReviewSettings } from '../hooks/useSolutionReviewSettings';
import PreparedComment, { markdownLabel } from 'components/Forms/PreparedComment';
import { StudentContacts } from '../StudentContacts';
import { Message } from './Message';
import { CommentAvatar } from './CommentAvatar';
import { CommentUsername } from './CommentUsername';

type Props = {
  children?: JSX.Element;
  sessionGithubId: string;
  courseId: number;
  reviewNumber: number;
  settings: SolutionReviewSettings;
  courseTaskId: number | null;
  review: SolutionReviewType;
  isActiveReview: boolean;
  areMessagesVisible?: boolean;
  role: TaskSolutionResultRole;
  maxScore?: number;
};

export function SolutionReview(props: Props) {
  const {
    children,
    sessionGithubId,
    courseId,
    reviewNumber,
    settings,
    courseTaskId,
    review,
    isActiveReview,
    areMessagesVisible = true,
    role,
    maxScore,
  } = props;
  const { id, author, comment, score, dateTime } = review;
  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const handleSubmit = async (values: { content: string }) => {
    const { content } = values;

    if (courseTaskId) {
      try {
        await courseService.postTaskSolutionResultMessage(id, courseTaskId, {
          content: `${markdownLabel}${content}`,
          role: role,
        });

        message.success('The message has been sent.');
        form.resetFields(['content']);
      } catch (error) {
        message.error('An error occurred. Please try later.');
      }
    }
  };

  return (
    <>
      <Row>
        <Col span={24}>
          <Divider style={{ margin: '8px 0' }} />
        </Col>
      </Row>

      <Row>
        <Col>
          <Comment
            avatar={
              <CommentAvatar
                author={author}
                role={TaskSolutionResultRole.Checker}
                areStudentContactsVisible={settings.areStudentContactsVisible}
                size={32}
              />
            }
            content={
              <>
                <Row>
                  <Col>
                    <CommentUsername
                      reviewNumber={reviewNumber}
                      author={author}
                      role={TaskSolutionResultRole.Checker}
                      areStudentContactsVisible={settings.areStudentContactsVisible}
                    />
                  </Col>
                </Row>

                <Row>
                  <Typography.Text type="secondary" style={{ marginBottom: 8, fontSize: 12 }}>
                    {formatDateTime(dateTime)}
                  </Typography.Text>
                </Row>

                <Row gutter={4} align="middle">
                  <Col>
                    <ScoreIcon maxScore={maxScore} score={score} isOutdatedScore={!isActiveReview} />
                  </Col>
                  <Col>
                    <Typography.Text>{score}</Typography.Text>
                  </Col>
                </Row>

                <Row style={{ marginBottom: 24 }}>
                  <Typography.Text style={{ fontSize: 12, lineHeight: '12px' }} type="secondary">
                    maximum score: {maxScore ?? 'unknown'}
                  </Typography.Text>
                </Row>

                <Row>
                  <Col>
                    <PreparedComment text={comment} />
                  </Col>
                </Row>

                <Row>
                  {settings.areStudentContactsVisible && author && <StudentContacts discord={author.discord} />}
                </Row>
              </>
            }
          >
            {children}

            {review.messages.map((message, index) => (
              <Row key={index}>
                <Col>
                  <Message reviewNumber={reviewNumber} message={message} settings={settings} />
                </Col>
              </Row>
            ))}

            {areMessagesVisible && (
              <Row>
                <Col span={24}>
                  <Comment
                    avatar={
                      <CommentAvatar
                        author={
                          role === TaskSolutionResultRole.Checker
                            ? author && { githubId: sessionGithubId, discord: null }
                            : { githubId: sessionGithubId, discord: null }
                        }
                        role={role}
                        areStudentContactsVisible={settings.areStudentContactsVisible}
                        size={24}
                      />
                    }
                    content={
                      <Form form={form} onFinish={handleSubmit} initialValues={{ content: '' }}>
                        <Row>
                          <Col span={24}>
                            <Form.Item name="content" rules={[{ required: true, message: 'Please enter message' }]}>
                              <Input.TextArea rows={3} showCount maxLength={512} style={{ maxWidth: 768 }} />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row>
                          <Col>
                            <Button htmlType="submit" icon={<MessageFilled />} type="primary">
                              Send message
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    }
                  />
                </Col>
              </Row>
            )}
          </Comment>
        </Col>
      </Row>

      <style jsx>{`
        :global(.ant-comment-avatar) {
          position: sticky;
          top: 16px;
          align-self: start;
        }

        :global(.ant-comment-avatar img) {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </>
  );
}
