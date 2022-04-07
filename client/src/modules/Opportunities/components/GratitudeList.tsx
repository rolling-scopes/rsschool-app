import { Button, Col, List, Tooltip, Typography } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { GratitudeDto } from 'api';

const { Text, Paragraph } = Typography;

type Props = {
  feedback: GratitudeDto[];
  showCount: number;
};

export function GratitudeList({ feedback, showCount }: Props) {
  if (!feedback.length) {
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
        const { comment, date } = feedback;
        const feedbackDate = moment(date);
        return {
          comment,
          dateFormatted: feedbackDate.format('YYYY-MM-DD HH:mm:ss'),
          relativeDate: feedbackDate.fromNow().toLowerCase(),
        };
      }),
    [feedbackToShow],
  );

  return (
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
  );
}
