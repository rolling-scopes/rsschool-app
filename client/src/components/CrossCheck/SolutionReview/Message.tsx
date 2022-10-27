import { CheckOutlined } from '@ant-design/icons';
import { Badge, Col, Comment, Row, Tag, Tooltip, Typography } from 'antd';
import { formatDateTime } from 'services/formatter';
import { TaskSolutionResultMessage, TaskSolutionResultRole } from 'services/course';
import { SolutionReviewSettings } from '../hooks/useSolutionReviewSettings';
import PreparedComment from 'components/Forms/PreparedComment';
import { CommentAvatar } from './CommentAvatar';
import { CommentUsername } from './CommentUsername';

const ROLE_TAG_COLOR = {
  [TaskSolutionResultRole.Checker]: 'processing',
  [TaskSolutionResultRole.Student]: 'success',
};

type Props = {
  reviewNumber: number;
  message: TaskSolutionResultMessage;
  currentRole: TaskSolutionResultRole;
  settings: SolutionReviewSettings;
};

export function Message(props: Props) {
  const { reviewNumber, message, settings } = props;
  const { timestamp, content, author, role, isCheckerRead, isStudentRead } = message;
  const { areStudentContactsVisible } = settings;
  const isBadgeDotVisible = getBadgeDotVisibility(props);

  return (
    <Comment
      avatar={
        <Tooltip title={isBadgeDotVisible ? 'Unread message' : ''} placement="topLeft">
          <Badge dot={isBadgeDotVisible}>
            <CommentAvatar
              author={author && { ...author, discord: null }}
              role={role}
              areStudentContactsVisible={areStudentContactsVisible}
              size={24}
            />
          </Badge>
        </Tooltip>
      }
      content={
        <>
          <Row>
            <Col>
              <CommentUsername
                reviewNumber={reviewNumber}
                author={author && { ...author, discord: null }}
                role={role}
                areStudentContactsVisible={settings.areStudentContactsVisible}
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Tag color={ROLE_TAG_COLOR[role]}>{role}</Tag>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 8 }}>
            <Col>
              <Typography.Text type="secondary" style={{ marginBottom: 8, fontSize: 12 }}>
                {formatDateTime(timestamp)}
              </Typography.Text>
            </Col>

            {(isCheckerRead || isStudentRead) && (
              <Row>
                {isCheckerRead && (
                  <Col>
                    <Tooltip title={'Checker read this message'} placement="bottom">
                      <CheckOutlined style={{ color: '#0f8ee8' }} />
                    </Tooltip>
                  </Col>
                )}

                {isStudentRead && (
                  <Col>
                    <Tooltip title={'Student read this message'} placement="bottom">
                      <CheckOutlined style={{ color: '#52C41A' }} />
                    </Tooltip>
                  </Col>
                )}
              </Row>
            )}
          </Row>

          <Row>
            <Col>
              <PreparedComment text={content} />
            </Col>
          </Row>
        </>
      }
    />
  );
}

function getBadgeDotVisibility(props: Props): boolean {
  const { message, currentRole } = props;
  const { isCheckerRead, isStudentRead } = message;

  switch (currentRole) {
    case TaskSolutionResultRole.Checker:
      return !isCheckerRead;

    case TaskSolutionResultRole.Student:
      return !isStudentRead;

    default:
      return false;
  }
}
