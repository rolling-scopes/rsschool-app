import * as React from 'react';
import dayjs from 'dayjs';
import relative from 'dayjs/plugin/relativeTime';
import { PublicFeedback } from 'common/models/profile';
import { Typography, Tooltip, Modal, Row, Col } from 'antd';
import { Comment } from '@ant-design/compatible';
import { GithubAvatar } from 'components/GithubAvatar';
import heroesBadges from '../../configs/heroes-badges';

dayjs.extend(relative);

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
        open={this.props.isVisible}
        onCancel={this.props.onHide}
        footer={null}
        width={'80%'}
      >
        <Row gutter={[16, 16]}>
          {badges.map(({ fromUser, comment, feedbackDate, badgeId }, idx) => (
            <Col key={`modal-comment-${idx}`} xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 6 }}>
              <Comment
                author={<a href={`/profile?githubId=${fromUser.githubId}`}>{fromUser.name}</a>}
                avatar={<GithubAvatar size={48} githubId={fromUser.githubId} />}
                content={
                  <>
                    {badgeId ? (
                      <Text strong style={{ fontSize: 12 }}>
                        {heroesBadges[badgeId].name}
                      </Text>
                    ) : (
                      ''
                    )}
                    <p style={{ marginBottom: 5 }}>{comment}</p>
                  </>
                }
                datetime={
                  <Tooltip title={dayjs(feedbackDate).format('YYYY-MM-DD HH:mm:ss')}>
                    <span>{dayjs(feedbackDate).fromNow()}</span>
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
