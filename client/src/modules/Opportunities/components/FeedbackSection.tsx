import { Typography } from 'antd';
import * as React from 'react';
import { CVFeedback } from '../../../../../common/models/cv';
import Section from './Section';
import { FeedbackList } from './FeedbackList';

const { Text } = Typography;

type Props = {
  feedback: CVFeedback[] | null;
};

export function FeedbackSection({ feedback }: Props) {
  if (!feedback) {
    return null;
  }

  const feedbackAvailable = feedback !== null && feedback.length !== 0;
  const title = feedbackAvailable ? `Total count: ${feedback!.length}` : 'No feedback yet';

  const sectionContent = (
    <>
      <Text>{title}</Text>
      <br />
      <FeedbackList feedback={feedback as CVFeedback[]} showCount={5} />
    </>
  );

  return <Section content={sectionContent} title="Feedback" />;
}
