import * as React from 'react';
import moment from 'moment';
import { PublicFeedback } from '../../../../common/models/profile';
// import { GithubAvatar } from 'components';
import {
  Typography,
  Comment,
  Tooltip,
  Avatar,
  Badge,
} from 'antd';
import CommonCard from './CommonCard';
import PublicFeedbackModal from './PublicFeedbackModal';
import heroesBadges from '../../configs/heroes-badges';

const { Text, Paragraph } = Typography;

import {
  MessageOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';

type Props = {
  data: PublicFeedback[];
};

interface State {
  badgesCount: {
    [key: string]: number;
  };
  isPublicFeedbackModalVisible: boolean;
}

class PublicFeedbackCard extends React.Component<Props, State> {
  state = {
    badgesCount: {},
    isPublicFeedbackModalVisible: false,
  };

  private showPublicFeedbackModal = () => {
    this.setState({ isPublicFeedbackModalVisible: true });
  }

  private hidePublicFeedbackModal = () => {
    this.setState({ isPublicFeedbackModalVisible: false });
  }

  private countBadges = () => {
    const receivedBadges = this.props.data;
    const badgesCount = {};

    receivedBadges.forEach(({ badgeId }) => {
      if (badgeId) {
        badgesCount[badgeId] ?
          badgesCount[badgeId] += 1 :
          badgesCount[badgeId] = 1;
      }
    });

    return badgesCount;
  };

  componentDidMount() {
    const badgesCount = this.countBadges();
    this.setState({ badgesCount });
  };

  render() {
    const badges = this.props.data;
    const { badgesCount } = this.state;

    return (
      <>
        <PublicFeedbackModal
          data={badges}
          isVisible={this.state.isPublicFeedbackModalVisible}
          onHide={this.hidePublicFeedbackModal}
        />
        <CommonCard
          title="Public Feedback"
          icon={<MessageOutlined />}
          actions={[
            <FullscreenOutlined key="card-public-feedback-button-more" onClick={this.showPublicFeedbackModal}/>,
          ]}
          content={
            <>
              <div style={{ marginBottom: 20 }}>
                <Text strong>Total badges:</Text> {badges.length}
              </div>
              <div style={{ marginBottom: 30 }}>
                {
                  Object.keys(badgesCount).map((badgeId) => (
                    <div style={{ margin: 5, display: 'inline-block' }} key={`badge-${badgeId}`}>
                      <Badge count={badgesCount[badgeId]}>
                        <Tooltip title={heroesBadges[badgeId].name}>
                          <Avatar
                            src={`https://heroes.by/api/images/${heroesBadges[badgeId].pictureId}/content/original`}
                            alt={`${badgeId} badge`}
                            size={48}
                          />
                        </Tooltip>
                      </Badge>
                    </div>
                  ))
                }
              </div>
              <div style={{ marginBottom: 0 }}>
                <Text strong>Last feedback:</Text>
              </div>
              {
                badges.slice(0, 1).map(({ fromUser, comment, feedbackDate, badgeId }, idx) => (
                  <Comment
                    key={`comment-${idx}`}
                    author={<a href={`/profile?githubId=${fromUser.githubId}`}>{fromUser.name}</a>}
                    avatar={
                      <Avatar
                        src={`https://github.com/${fromUser.githubId}.png?size=${48}`}
                        alt={`${fromUser.githubId} avatar`}
                      />
                    }
                    content={
                      <>
                        {
                          badgeId ?
                            <Text strong style={{ fontSize: 12 }}>
                              {heroesBadges[badgeId].name}
                            </Text> :
                            ''
                        }
                        <Paragraph ellipsis={{ rows: 3, expandable: true }}>
                          {comment}
                        </Paragraph>
                      </>
                    }
                    datetime={
                      <Tooltip title={moment(feedbackDate).format('YYYY-MM-DD HH:mm:ss')}>
                        <span>{moment(feedbackDate).fromNow()}</span>
                      </Tooltip>
                    }
                  />
                ))
              }
            </>
          }
        />
      </>
    );
  }
}

export default PublicFeedbackCard;
