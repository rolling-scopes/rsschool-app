import * as React from 'react';
import { Row, Col, Typography, Comment, Tooltip, Avatar, Button } from 'antd';
import moment from 'moment';
import SectionCV from '../SectionCV';
import { SafetyOutlined } from '@ant-design/icons';
import { PublicFeedback } from '../../../../../common/models/profile';
import heroesBadges from '../../../configs/heroes-badges';

const { Text, Paragraph } = Typography;

type Props = {
  badgesData: PublicFeedback[] | null;
};

function BadgesSection(props: Props) {
  const { badgesData } = props;

  const badgesAvailable = badgesData !== null && badgesData.length;
  const title = badgesAvailable ? `Total bagdes count: ${badgesData!.length}` : 'No badges yet';

  const sectionContent = (
    <>
      <Row style={{ fontSize: '16px' }}>
        <Col>
          <Text>{title}</Text>
        </Col>
      </Row>
      {badgesAvailable && <Badges badges={badgesData as PublicFeedback[]} showCount={5} />}
    </>
  );

  const icon = <SafetyOutlined />;

  return <SectionCV content={sectionContent} title="Public feedback" icon={icon} />;
}

function Badges(props: { badges: PublicFeedback[]; showCount: number }) {
  const { badges, showCount } = props;

  const badgeStyle = {
    padding: '2px',
    border: '1px solid black',
    borderRadius: '15px',
    marginBottom: '8px',
  };

  const badgesPartial = badges.slice(0, showCount);
  const expansionNeeded = badges.length > showCount;

  const [badgesToShow, setBadgesToShow] = React.useState(badgesPartial);
  const [allBadgesVisible, setAllBadgesVisible] = React.useState(!expansionNeeded);

  const showAllBadges = () => {
    setBadgesToShow(badges);
    setAllBadgesVisible(true);
  };

  const showBadgesPartially = () => {
    setBadgesToShow(badgesPartial);
    setAllBadgesVisible(false);
  };

  const badgesElements = badgesToShow.map((badge, index) => {
    const {
      fromUser: { githubId, name },
      comment,
      feedbackDate,
      badgeId,
    } = badge;

    return (
      <Comment
        key={`badge-${index}`}
        author={<a href={`/profile?githubId=${githubId}`}>{name}</a>}
        avatar={<Avatar src={`https://github.com/${githubId}.png?size=${48}`} alt={`${githubId} avatar`} />}
        style={badgeStyle}
        content={
          <>
            {badgeId ? (
              <Text strong style={{ fontSize: 12, width: '100%' }}>
                {(heroesBadges as any)[badgeId].name}
              </Text>
            ) : (
              ''
            )}
            <Paragraph ellipsis={{ rows: 2, expandable: true }}>{comment}</Paragraph>
          </>
        }
        datetime={
          <Tooltip title={moment(feedbackDate).format('YYYY-MM-DD HH:mm:ss')}>
            <span>{moment(feedbackDate).fromNow()}</span>
          </Tooltip>
        }
      />
    );
  });

  return (
    <Row style={{ fontSize: '16px' }}>
      <Col flex={1}>
        <Text>Recent feedback</Text>
        {badgesElements}
        {expansionNeeded &&
          (allBadgesVisible ? (
            <Button onClick={showBadgesPartially}>Show partially</Button>
          ) : (
            <Button onClick={showAllBadges}>Show all</Button>
          ))}
      </Col>
    </Row>
  );
}

export default BadgesSection;
