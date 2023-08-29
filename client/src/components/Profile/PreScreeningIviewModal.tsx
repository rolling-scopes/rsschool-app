import * as React from 'react';
import { Modal, Tag } from 'antd';
import { formatDate } from 'services/formatter';
import { Rating } from 'components/Rating';
import { LegacyFeedback, StageInterviewDetailedFeedback } from 'common/models/profile';
import { LegacyScreeningFeedback } from './LegacyScreeningFeedback';
import { PrescreeningFeedback } from './PrescreeningFeedback';
import { getRating } from 'domain/interview';

type Props = {
  interviewResult: StageInterviewDetailedFeedback;
  isVisible: boolean;
  onHide: () => void;
};

class PreScreeningIviewModal extends React.PureComponent<Props> {
  render() {
    const { interviewResult, isVisible, onHide } = this.props;
    const { courseFullName, date, score, interviewer, isGoodCandidate, feedback, version, maxScore } = interviewResult;
    return (
      <Modal
        title={`${courseFullName} Pre-Screening Interview Feedback`}
        open={isVisible}
        onCancel={onHide}
        footer={null}
        width={'80%'}
      >
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
