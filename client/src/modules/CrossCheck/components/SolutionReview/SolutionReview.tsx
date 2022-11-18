import { useEffect, useMemo, useState } from 'react';
import { ScoreIcon } from 'components/Icons/ScoreIcon';
import { Alert, Col, Comment, Divider, Form, message, notification, Row, Spin, Typography } from 'antd';
import {
  CourseService,
  SolutionReviewType,
  TaskSolutionResultMessage,
  CrossCheckMessageAuthorRole,
} from 'services/course';
import { formatDateTime } from 'services/formatter';
import { SolutionReviewSettings } from 'modules/CrossCheck/constants';
import PreparedComment, { markdownLabel } from 'components/Forms/PreparedComment';
import { StudentContacts } from 'components/CrossCheck/StudentContacts';
import { UserAvatar } from './UserAvatar';
import { Username } from './Username';
import { Message } from './Message';
import { MessageSendingPanel } from './MessageSendingPanel';

export type SolutionReviewProps = {
  children?: JSX.Element;
  sessionId: number;
  sessionGithubId: string;
  courseId: number;
  reviewNumber: number;
  settings: SolutionReviewSettings;
  courseTaskId: number | null;
  review: SolutionReviewType;
  isActiveReview: boolean;
  isMessageSendingPanelVisible?: boolean;
  currentRole: CrossCheckMessageAuthorRole;
  maxScore?: number;
};

function SolutionReview(props: SolutionReviewProps) {
  const {
    children,
    sessionId,
    sessionGithubId,
    courseId,
    reviewNumber,
    settings,
    courseTaskId,
    review,
    isActiveReview,
    isMessageSendingPanelVisible = true,
    currentRole,
    maxScore,
  } = props;
  const { id, dateTime, author, comment, score, messages } = review;

  const [loading, setLoading] = useState<boolean>(false);
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
    setLoading(true);

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
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Spin spinning={loading}>
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
                role={CrossCheckMessageAuthorRole.Reviewer}
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
                      role={CrossCheckMessageAuthorRole.Reviewer}
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

            {isMessageSendingPanelVisible && (
              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Form form={form} onFinish={handleSubmit} initialValues={{ content: '' }}>
                    <MessageSendingPanel
                      sessionId={sessionId}
                      sessionGithubId={sessionGithubId}
                      author={author}
                      currentRole={currentRole}
                      areContactsVisible={settings.areContactsVisible}
                    />
                  </Form>
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
    </Spin>
  );
}

type GetAmountUnreadMessagesProps = {
  currentRole: CrossCheckMessageAuthorRole;
  messages: TaskSolutionResultMessage[];
};

function getAmountUnreadMessages(props: GetAmountUnreadMessagesProps): number {
  const { currentRole, messages } = props;

  switch (currentRole) {
    case CrossCheckMessageAuthorRole.Reviewer:
      return messages.filter(messages => !messages.isReviewerRead).length;

    case CrossCheckMessageAuthorRole.Student:
      return messages.filter(messages => !messages.isStudentRead).length;

    default:
      return 0;
  }
}

function getHowManyUnreadMessagesText(amountUnreadMessages: number) {
  return `You have ${amountUnreadMessages} unread ${amountUnreadMessages > 1 ? 'messages' : 'message'}`;
}

export default SolutionReview;
