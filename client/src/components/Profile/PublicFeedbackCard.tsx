import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { Typography, Tooltip } from 'antd';
import { Comment } from '@ant-design/compatible';
import FullscreenOutlined from '@ant-design/icons/FullscreenOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import CommonCard from './CommonCard';
import PublicFeedbackModal from './PublicFeedbackModal';
import heroesBadges from '../../configs/heroes-badges';
import { PublicFeedback } from 'common/models/profile';
import { GithubAvatar } from 'components/GithubAvatar';
import dayjs from 'dayjs';
import relative from 'dayjs/plugin/relativeTime';
import HeroesCountBadge from 'modules/Heroes/HeroesCountBadge';

dayjs.extend(relative);

const { Text, Paragraph } = Typography;

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
  state: State = {
    badgesCount: {},
    isPublicFeedbackModalVisible: false,
  };

  private showPublicFeedbackModal = () => {
    this.setState({ isPublicFeedbackModalVisible: true });
  };

  private hidePublicFeedbackModal = () => {
    this.setState({ isPublicFeedbackModalVisible: false });
  };

  private countBadges = () => {
    const receivedBadges = this.props.data;
    const badgesCount: any = {};

    receivedBadges.forEach(({ badgeId }) => {
      if (badgeId) {
        badgesCount[badgeId] ? (badgesCount[badgeId] += 1) : (badgesCount[badgeId] = 1);
      }
    });

    return badgesCount;
  };

  shouldComponentUpdate = (_nextProps: Props, nextState: State) =>
    !(nextState.isPublicFeedbackModalVisible === this.state.isPublicFeedbackModalVisible) ||
    !isEqual(nextState.badgesCount, this.state.badgesCount);

  componentDidMount() {
    const badgesCount = this.countBadges();
    this.setState({ badgesCount });
  }

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
            <FullscreenOutlined key="card-public-feedback-button-more" onClick={this.showPublicFeedbackModal} />,
          ]}
          content={
            <>
              <div style={{ marginBottom: 20 }}>
                <Text strong>Total badges:</Text> {badges.length}
              </div>
              <div style={{ marginBottom: 30 }}>
                {Object.keys(badgesCount).map(badgeId => (
                  <HeroesCountBadge badge={{ badgeId, badgeCount: badgesCount[badgeId] }} />
                ))}
              </div>
              <div style={{ marginBottom: 0 }}>
                <Text strong>Last feedback:</Text>
              </div>
              {badges.slice(0, 1).map(({ fromUser, comment, feedbackDate, badgeId }, idx) => (
                <Comment
                  key={`comment-${idx}`}
                  author={<a href={`/profile?githubId=${fromUser.githubId}`}>{fromUser.name}</a>}
                  avatar={<GithubAvatar size={48} githubId={fromUser.githubId} />}
                  content={
                    <>
                      {badgeId ? (
                        <Text strong style={{ fontSize: 12 }}>
                          {(heroesBadges as any)[badgeId].name}
                        </Text>
                      ) : (
                        ''
                      )}
                      <Paragraph ellipsis={{ rows: 3, expandable: true }}>{comment}</Paragraph>
                    </>
                  }
                  datetime={
                    <Tooltip title={dayjs(feedbackDate).format('YYYY-MM-DD HH:mm:ss')}>
                      <span>{dayjs(feedbackDate).fromNow()}</span>
                    </Tooltip>
                  }
                />
              ))}
            </>
          }
        />
      </>
    );
  }
}

export default PublicFeedbackCard;
