import { useEffect, useMemo } from 'react';
import { ScoreIcon } from 'components/Icons/ScoreIcon';
import { Alert, Button, Col, Comment, Divider, Form, Input, message, notification, Row, Typography } from 'antd';
import { MessageFilled } from '@ant-design/icons';
import { CourseService, SolutionReviewType, TaskSolutionResultMessage, TaskSolutionResultRole } from 'services/course';
import { formatDateTime } from 'services/formatter';
import { SolutionReviewSettings } from 'modules/CrossCheck/constants';
import PreparedComment, { markdownLabel } from 'components/Forms/PreparedComment';
import { StudentContacts } from 'components/CrossCheck/StudentContacts';
import { Message } from './Message';
import { UserAvatar } from './UserAvatar';
import { Username } from './Username';

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
  currentRole: TaskSolutionResultRole;
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
    currentRole,
    maxScore,
  } = props;
  const { id, dateTime, author, comment, score, messages } = review;
  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const amountUnreadMessages = getAmountUnreadMessages({ currentRole, messages });
  const howManyUnreadMessagesText = getHowManyUnreadMessagesText(amountUnreadMessages);

  useEffect(() => {
    if (!amountUnreadMessages) return;

    notification.info({
      message: howManyUnreadMessagesText,
    });

    if (courseTaskId) {
      (async () => {
        try {
          await courseService.updateTaskSolutionResultMessages(id, courseTaskId, {
            role: currentRole,
          });
        } catch (error) {
          message.error('An error occurred. Please try later.');
        }
      })();
    }
  }, []);

  const handleSubmit = async (values: { content: string }) => {
    const { content } = values;

    if (courseTaskId) {
      try {
        await courseService.postTaskSolutionResultMessages(id, courseTaskId, {
          content: `${markdownLabel}${content}`,
          role: currentRole,
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
      <Row style={{ margin: '8px 0' }}>
        <Col span={24}>
          <Divider style={{ margin: 0 }} />
        </Col>
      </Row>

      {amountUnreadMessages > 0 && (
        <Row>
          <Col>
            <Alert message={howManyUnreadMessagesText} type="info" showIcon />
          </Col>
        </Row>
      )}

      <Row style={{ margin: '16px 0' }}>
        <Col>
          <Comment
            avatar={
              <UserAvatar
                author={author}
                role={TaskSolutionResultRole.Reviewer}
                areContactsVisible={settings.areContactsVisible}
                size={32}
              />
            }
            content={
              <>
                <Row>
                  <Col>
                    <Username
                      reviewNumber={reviewNumber}
                      author={author}
                      role={TaskSolutionResultRole.Reviewer}
                      areContactsVisible={settings.areContactsVisible}
                    />
                  </Col>
                </Row>

                {dateTime && (
                  <Row>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDateTime(dateTime)}
                    </Typography.Text>
                  </Row>
                )}

                <Row gutter={4} align="middle" style={{ marginTop: 8 }}>
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

                <Row>{settings.areContactsVisible && author && <StudentContacts discord={author.discord} />}</Row>
              </>
            }
          >
            {children}

            {messages.map((message, index) => (
              <Row key={index} style={{ margin: '16px 0' }}>
                <Col>
                  <Message
                    reviewNumber={reviewNumber}
                    message={message}
                    currentRole={currentRole}
                    settings={settings}
                  />
                </Col>
              </Row>
            ))}

            {areMessagesVisible && (
              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Comment
                    avatar={
                      <UserAvatar
                        author={
                          currentRole === TaskSolutionResultRole.Reviewer
                            ? author && { githubId: sessionGithubId, discord: null }
                            : { githubId: sessionGithubId, discord: null }
                        }
                        role={currentRole}
                        areContactsVisible={settings.areContactsVisible}
                        size={24}
                      />
                    }
                    content={
                      <Form form={form} onFinish={handleSubmit} initialValues={{ content: '' }}>
                        <Row>
                          <Col span={24}>
                            <Form.Item name="content" rules={[{ required: true, message: 'Please enter message' }]}>
                              <Input.TextArea rows={3} showCount maxLength={512} style={{ maxWidth: 512 }} />
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
        :global(.ant-comment-inner) {
          padding: 0;
        }

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

type GetAmountUnreadMessagesProps = {
  currentRole: TaskSolutionResultRole;
  messages: TaskSolutionResultMessage[];
};

function getAmountUnreadMessages(props: GetAmountUnreadMessagesProps): number {
  const { currentRole, messages } = props;

  switch (currentRole) {
    case TaskSolutionResultRole.Reviewer:
      return messages.filter(messages => !messages.isReviewerRead).length;

    case TaskSolutionResultRole.Student:
      return messages.filter(messages => !messages.isStudentRead).length;

    default:
      return 0;
  }
}

function getHowManyUnreadMessagesText(amountUnreadMessages: number) {
  return `You have ${amountUnreadMessages} unread ${amountUnreadMessages > 1 ? 'messages' : 'message'}`;
}
