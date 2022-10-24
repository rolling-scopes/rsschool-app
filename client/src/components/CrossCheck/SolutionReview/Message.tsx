import { Col, Comment, Row, Tag, Typography } from 'antd';
import { formatDateTime } from 'services/formatter';
import { TaskSolutionResultMessage, TaskSolutionResultRole } from 'services/course';
import { SolutionReviewSettings } from '../hooks/useSolutionReviewSettings';
import PreparedComment from 'components/Forms/PreparedComment';
import { CommentAvatar } from './CommentAvatar';
import { CommentUsername } from './CommentUsername';

const ROLE_TAG_COLOR = {
  [TaskSolutionResultRole.Checker]: 'processing',
  [TaskSolutionResultRole.Student]: '',
};

type Props = {
  reviewNumber: number;
  message: TaskSolutionResultMessage;
  settings: SolutionReviewSettings;
};

export function Message(props: Props) {
  const { reviewNumber, message, settings } = props;
  const { timestamp, content, author, role } = message;
  const { areStudentContactsVisible } = settings;

  return (
    <Col>
      <Comment
        avatar={
          <CommentAvatar
            author={author && { ...author, discord: null }}
            role={role}
            areStudentContactsVisible={areStudentContactsVisible}
            size={24}
          />
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

            {role !== TaskSolutionResultRole.Student && (
              <Row>
                <Col>{<Tag color={ROLE_TAG_COLOR[role]}>{role}</Tag>}</Col>
              </Row>
            )}

            <Row>
              <Typography.Text type="secondary" style={{ marginBottom: 8, fontSize: 12 }}>
                {formatDateTime(timestamp)}
              </Typography.Text>
            </Row>

            <Row>
              <PreparedComment text={content} />
            </Row>
          </>
        }
      />
    </Col>
  );
}
