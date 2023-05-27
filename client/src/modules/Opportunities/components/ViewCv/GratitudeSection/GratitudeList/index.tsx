import { Button, Col, List, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState, useMemo } from 'react';
import { GratitudeDto } from 'api';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

type Props = {
  feedback?: GratitudeDto[];
  showCount: number;
};

export function GratitudeList({ feedback, showCount }: Props) {
  const feedbackPartial = feedback?.slice(0, showCount);
  const expansionNeeded = Number(feedback?.length) > showCount;

  const [feedbackToShow, setFeedbackToShow] = useState(feedbackPartial);
  const [allFeedbackVisible, setAllFeedbackVisible] = useState(!expansionNeeded);

  const showAllFeedback = () => {
    setFeedbackToShow(feedback);
    setAllFeedbackVisible(true);
  };

  const showFeedbackPartially = () => {
    setFeedbackToShow(feedbackPartial);
    setAllFeedbackVisible(false);
  };

  const dataSource = useMemo(
    () =>
      feedbackToShow?.map(feedback => {
        const { comment, date } = feedback;
        const feedbackDate = dayjs(date);
        return {
          comment,
          dateFormatted: feedbackDate.format('YYYY-MM-DD HH:mm:ss'),
          relativeDate: feedbackDate.fromNow().toLowerCase(),
        };
      }),
    [feedbackToShow],
  );

  return feedback?.length && feedback.length > 0 ? (
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
  ) : null;
}
