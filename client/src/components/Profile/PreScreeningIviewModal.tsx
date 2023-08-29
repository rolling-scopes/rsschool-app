import * as React from 'react';
import { Modal, Tag } from 'antd';
import { formatDate } from 'services/formatter';
import { Rating } from 'components/Rating';
import { LegacyFeedback, StageInterviewDetailedFeedback } from 'common/models/profile';
import { LegacyScreeningFeedback } from './LegacyScreeningFeedback';
import { PrescreeningFeedback } from './PrescreeningFeedback';
import { DecisionTag, getRating } from 'domain/interview';
import { Decision } from 'data/interviews/technical-screening';

type Props = {
  interviewResult: StageInterviewDetailedFeedback;
  isVisible: boolean;
  onHide: () => void;
};

class PreScreeningIviewModal extends React.PureComponent<Props> {
  render() {
    const { interviewResult, isVisible, onHide } = this.props;
    const { courseFullName, date, score, interviewer, isGoodCandidate, feedback, version, maxScore, decision } =
      interviewResult;
    return (
      <Modal
        title={`${courseFullName} Pre-Screening Interview Feedback`}
        open={isVisible}
        onCancel={onHide}
        footer={null}
        width={'80%'}
      >
        <DecisionTag decision={decision as Decision} />
        <Rating rating={getRating(score, maxScore, version)} />
        <p style={{ marginBottom: 5 }}>Date: {formatDate(date)}</p>
        {isGoodCandidate != null ? (
          <p style={{ marginBottom: 5 }}>
            Good candidate: {isGoodCandidate ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
          </p>
        ) : null}
        <p style={{ marginBottom: 20 }}>
          Interviewer: <a href={`/profile?githubId=${interviewer.githubId}`}>{interviewer.name}</a>
        </p>
        {version === 0 && <LegacyScreeningFeedback feedback={feedback as LegacyFeedback} />}
        {version === 1 && <PrescreeningFeedback feedback={feedback} />}
      </Modal>
    );
  }
}

export default PreScreeningIviewModal;
