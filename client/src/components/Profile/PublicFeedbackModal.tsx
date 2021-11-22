import * as React from 'react';
import moment from 'moment';
import { PublicFeedback } from 'common/models/profile';
import { Typography, Comment, Avatar, Tooltip, Modal, Row, Col } from 'antd';
import heroesBadges from '../../configs/heroes-badges';

const { Text } = Typography;

type Props = {
  data: PublicFeedback[];
  isVisible: boolean;
  onHide: () => void;
};

class PublicFeedbackModal extends React.PureComponent<Props> {
  render() {
    const badges = this.props.data;

    return (
      <Modal
        title="Public Feedback"
        visible={this.props.isVisible}
        onCancel={this.props.onHide}
        footer={null}
        width={'80%'}
      >
        <Row gutter={[16, 16]}>
          {badges.map(({ fromUser, comment, feedbackDate, badgeId }, idx) => (
            <Col key={`modal-comment-${idx}`} xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 6 }}>
              <Comment
                author={<a href={`/profile?githubId=${fromUser.githubId}`}>{fromUser.name}</a>}
                avatar={
                  <Avatar
                    src={`https://github.com/${fromUser.githubId}.png?size=${48}`}
                    alt={`${fromUser.githubId} avatar`}
                  />
                }
                content={
                  <>
                    {badgeId ? (
                      <Text strong style={{ fontSize: 12 }}>
                        {(heroesBadges as any)[badgeId].name}
                      </Text>
                    ) : (
                      ''
                    )}
                    <p style={{ marginBottom: 5 }}>{comment}</p>
                  </>
                }
                datetime={
                  <Tooltip title={moment(feedbackDate).format('YYYY-MM-DD HH:mm:ss')}>
                    <span>{moment(feedbackDate).fromNow()}</span>
                  </Tooltip>
                }
              />
            </Col>
          ))}
        </Row>
      </Modal>
    );
  }
}

export default PublicFeedbackModal;
