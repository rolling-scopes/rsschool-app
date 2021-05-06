import * as React from 'react';
import { Typography, Card, Tooltip, Button } from 'antd';
import moment from 'moment';
import SectionCV from '../SectionCV';
import { CommentOutlined } from '@ant-design/icons';
import { CVFeedback } from '../../../../../common/models/cv';

const { Text, Paragraph } = Typography;

type Props = {
  feedback: CVFeedback[] | null;
};

function FeedbackSection(props: Props) {
  const { feedback } = props;

  const feedbackAvailable = feedback !== null && feedback.length !== 0;
  const title = feedbackAvailable ? `Total feedback count: ${feedback!.length}` : 'No feedback yet';

  const sectionContent = (
    <>
      <Text>{title}</Text>
      <br />
      {feedbackAvailable && <FeedbackContent feedback={feedback as CVFeedback[]} showCount={5} />}
    </>
  );

  return (
    <SectionCV content={sectionContent} title="Public feedback" icon={<CommentOutlined className="hide-on-print" />} />
  );
}

function FeedbackContent(props: { feedback: CVFeedback[]; showCount: number }) {
  const { feedback, showCount } = props;

  const feedbackStyle = {
    padding: '2px',
    border: '1px solid black',
    borderRadius: '15px',
    marginBottom: '8px',
  };

  const feedbackPartial = feedback.slice(0, showCount);
  const expansionNeeded = feedback.length > showCount;

  const [feedbackToShow, setFeedbackToShow] = React.useState(feedbackPartial);
  const [allFeedbackVisible, setAllFeedbackVisible] = React.useState(!expansionNeeded);

  const showAllFeedback = () => {
    setFeedbackToShow(feedback);
    setAllFeedbackVisible(true);
  };

  const showFeedbackPartially = () => {
    setFeedbackToShow(feedbackPartial);
    setAllFeedbackVisible(false);
  };

  const feedbackElements = feedbackToShow.map((feedback, index) => {
    const { comment, feedbackDate } = feedback;

    return (
      <Card
        key={`feedback-${index}`}
        style={feedbackStyle}
        size="small"
        title={
          <Tooltip title={moment(feedbackDate).format('YYYY-MM-DD HH:mm:ss')}>
            <span>{moment(feedbackDate).fromNow().toUpperCase()}</span>
          </Tooltip>
        }
      >
        <Paragraph ellipsis={{ rows: 2, expandable: true }}>{comment}</Paragraph>
      </Card>
    );
  });

  return (
    <>
      <Text>Recent feedback</Text>
      {feedbackElements}
      {expansionNeeded &&
        (allFeedbackVisible ? (
          <Button className="hide-on-print" onClick={showFeedbackPartially}>
            Show partially
          </Button>
        ) : (
          <Button className="hide-on-print" onClick={showAllFeedback}>
            Show all
          </Button>
        ))}
    </>
  );
}

export default FeedbackSection;
