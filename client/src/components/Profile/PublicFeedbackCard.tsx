import isEqual from 'lodash/isEqual';
import { Typography, Tooltip, Avatar, Badge } from 'antd';
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

const PublicFeedbackCard = (props: Props) => {
  const [badgesCount, setBadgesCount] = useState({});
  const [isPublicFeedbackModalVisible, setIsPublicFeedbackModalVisible] = useState(false);

  const showPublicFeedbackModalHandler = useCallback(() => {
    setIsPublicFeedbackModalVisible(true);
  }, []);
  const hidePublicFeedbackModalHandler = useCallback(() => {
    setIsPublicFeedbackModalVisible(false);
  }, []);
  const countBadgesHandler = useCallback(() => {
    const receivedBadges = props.data;
    const badgesCount: any = {};

    receivedBadges.forEach(({ badgeId }) => {
      if (badgeId) {
        badgesCount[badgeId] ? (badgesCount[badgeId] += 1) : (badgesCount[badgeId] = 1);
      }
    });

    return badgesCount;
  }, [badgesCount]);
  const shouldComponentUpdateHandler = useCallback(
    (_nextProps: Props, nextState: State) =>
      !(nextState.isPublicFeedbackModalVisible === isPublicFeedbackModalVisible) ||
      !isEqual(nextState.badgesCount, badgesCount),
    [isPublicFeedbackModalVisible, badgesCount],
  );
  useEffect(() => {
    const badgesCount = countBadgesHandler();
    setBadgesCount(badgesCount);
  }, [badgesCount]);

  const badges = props.data;

  return (
    <>
      <PublicFeedbackModal
        data={badges}
        isVisible={isPublicFeedbackModalVisible}
        onHide={hidePublicFeedbackModalHandler}
      />
      <CommonCard
        title="Public Feedback"
        icon={<MessageOutlined />}
        actions={[
          <FullscreenOutlined key="card-public-feedback-button-more" onClick={showPublicFeedbackModalHandler} />,
        ]}
        content={
          <>
            <div style={{ marginBottom: 20 }}>
              <Text strong>Total badges:</Text> {badges.length}
            </div>
            <div style={{ marginBottom: 30 }}>
              {Object.keys(badgesCount).map(badgeId => (
                <div style={{ margin: 5, display: 'inline-block' }} key={`badge-${badgeId}`}>
                  <Badge count={badgesCount[badgeId]}>
                    <Tooltip title={(heroesBadges as any)[badgeId].name}>
                      <Avatar
                        src={`/static/svg/badges/${(heroesBadges as any)[badgeId].url}`}
                        alt={`${badgeId} badge`}
                        size={48}
                      />
                    </Tooltip>
                  </Badge>
                </div>
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
};

export default PublicFeedbackCard;
