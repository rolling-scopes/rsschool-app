import { Button, Col, List, Tooltip, Typography } from 'antd';
import { CVFeedback } from '../models';
import moment from 'moment';
import * as React from 'react';

const { Text, Paragraph } = Typography;

type Props = {
  feedback: CVFeedback[] | null;
  showCount: number;
};

export function FeedbackList({ feedback, showCount }: Props) {
  if (!feedback?.length) {
    return null;
  }

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
