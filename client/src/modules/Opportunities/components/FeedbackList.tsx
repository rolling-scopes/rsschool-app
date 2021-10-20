import * as React from 'react';
import { Typography, Card, Tooltip, Button, List, Col } from 'antd';
import moment from 'moment';
import { CVFeedback } from 'common/models/cv';

const { Text, Paragraph } = Typography;

type Props = {
  feedback: CVFeedback[] | null;
  showCount: number;
};

export function FeedbackList({ feedback, showCount }: Props) {
  if (feedback == null) {
    return null;
  }

  const feedbackStyle = {
    padding: '2px',
    border: '1px dotted #e0e0e0',
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

  const dataSource = React.useMemo(
    () =>
      feedbackToShow.map(feedback => {
        const { comment, feedbackDate } = feedback;
        const date = moment(feedbackDate);
        return {
          comment,
          dateFormatted: date.format('YYYY-MM-DD HH:mm:ss'),
          relativeDate: date.fromNow().toLowerCase(),
        };
      }),
    // .map(({ dateFormatted, relativeDate, comment }, i) => (
    //   <Card key={i} style={feedbackStyle} size="small">
    //     <Paragraph ellipsis={{ rows: 2, expandable: true }}>{comment} </Paragraph>
    //     <Card.Meta
    //       description={
    //         <Tooltip title={dateFormatted}>
    //           <span style={{ color: '#666' }}>{relativeDate}</span>
    //         </Tooltip>
    //       }
    //     />
    //   </Card>
    // )),
    [feedbackToShow],
  );

  return (
    <>
      <div>
        <List
          header={<Text strong>Recent Feedback</Text>}
          dataSource={dataSource}
          size="small"
          renderItem={({ dateFormatted, relativeDate, comment }, i) => (
            <List.Item key={i}>
              <Col flex={1} style={{ paddingRight: 16 }}>
                <Paragraph italic ellipsis={{ rows: 2, expandable: true }}>
                  {comment}{' '}
                </Paragraph>
              </Col>
              <Col style={{ minWidth: 100 }}>
                <Tooltip title={dateFormatted}>
                  <span style={{ color: '#666' }}>{relativeDate}</span>
                </Tooltip>
              </Col>
            </List.Item>
          )}
        />
        {expansionNeeded &&
          (allFeedbackVisible ? (
            <Button className="no-print" onClick={showFeedbackPartially}>
              Show partially
            </Button>
          ) : (
            <Button className="no-print" onClick={showAllFeedback}>
              Show all
            </Button>
          ))}
      </div>
    </>
  );
}
