import { CheckOutlined } from '@ant-design/icons';
import { Badge, Col, Comment, Row, Tag, Tooltip, Typography } from 'antd';
import { formatDateTime } from 'services/formatter';
import { CrossCheckMessage } from 'services/course';
import { ROLE_TAG_COLOR, SolutionReviewSettings } from 'modules/CrossCheck/constants';
import PreparedComment from 'components/Forms/PreparedComment';
import { UserAvatar } from '../UserAvatar';
import { Username } from '../Username';
import { CrossCheckMessageDtoRoleEnum } from 'api';

const { Text } = Typography;

export type MessageProps = {
  reviewNumber: number;
  message: CrossCheckMessage;
  currentRole: CrossCheckMessageDtoRoleEnum;
  settings: SolutionReviewSettings;
};

function Message(props: MessageProps) {
  const { reviewNumber, message, settings } = props;
  const { timestamp, content, author, role, isReviewerRead, isStudentRead } = message;
  const { areContactsVisible } = settings;
  const isBadgeDotVisible = getBadgeDotVisibility(props);

  return (
    <Comment
      avatar={
        <Tooltip title={isBadgeDotVisible ? 'Unread message' : ''} placement="topLeft">
          <Badge dot={isBadgeDotVisible}>
            <UserAvatar author={author} role={role} areContactsVisible={areContactsVisible} size={24} />
          </Badge>
        </Tooltip>
      }
      content={
        <>
          <Row>
            <Col>
              <Username
                reviewNumber={reviewNumber}
                author={author}
                role={role}
                areContactsVisible={settings.areContactsVisible}
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
              <Text type="secondary" style={{ marginBottom: 8, fontSize: 12 }}>
                {formatDateTime(timestamp)}
              </Text>
            </Col>

            {(isReviewerRead || isStudentRead) && (
              <Row>
                {isReviewerRead && (
                  <Col>
                    <Tooltip title={'Reviewer read this message'} placement="bottom">
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

function getBadgeDotVisibility(props: MessageProps): boolean {
  const { message, currentRole } = props;
  const { isReviewerRead, isStudentRead } = message;

  switch (currentRole) {
    case CrossCheckMessageDtoRoleEnum.Reviewer:
      return !isReviewerRead;

    case CrossCheckMessageDtoRoleEnum.Student:
      return !isStudentRead;

    default:
      return false;
  }
}

export default Message;
