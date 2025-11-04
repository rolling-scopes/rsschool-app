import { Flex, Modal, Space, Table, Tag, Typography } from 'antd';
import { CoreJsInterviewFeedback, LegacyFeedback, StageInterviewDetailedFeedback } from '@common/models';
import { DecisionTag, getRating } from '@client/domain/interview';
import { Decision } from '@client/data/interviews/technical-screening';
import {
  InterviewerWidget,
  IsGoodCandidateWidget,
  LegacyScreeningFeedback,
  PrescreeningFeedback,
} from '@client/components/Profile/ui';
import { formatDate } from '@client/services/formatter';
import { Rating } from '@client/components/Rating';

const { Text } = Typography;

type InterviewModalProps = {
  isVisible: boolean;
  onHide: () => void;
  coreJs?: { data: CoreJsInterviewFeedback; idx: number };
  prescreening?: { data: StageInterviewDetailedFeedback; idx: number };
};

function renderCoreJsModal({ data, idx }: { data: CoreJsInterviewFeedback; idx: number }) {
  if (!data.interviews[idx]) {
    return null;
  }
  const { score, comment, answers, interviewer } = data.interviews[idx];
  return (
    <Flex vertical gap="0.5em">
      <Text>
        Score: <Text mark>{score}</Text>
      </Text>
      <InterviewerWidget interviewer={interviewer} />
      {comment && (
        <Text style={{ paddingBottom: '1em' }}>
          <Text strong>Comment: </Text>
          {comment}
        </Text>
      )}
      <Table
        data-testid="profile-corejs-iviews-modal-table"
        dataSource={answers}
        size="small"
        rowKey="questionId"
        pagination={false}
        columns={[
          {
            dataIndex: 'questionText',
            ellipsis: true,
          },
          {
            dataIndex: 'answer',
            render: answer =>
              answer === true ? <Tag color="green">Yes</Tag> : answer === false ? <Tag color="red">No</Tag> : answer,
          },
        ]}
      />
    </Flex>
  );
}

function renderPreScreeningModal({ data }: { data: StageInterviewDetailedFeedback; idx: number }) {
  if (!data) {
    return null;
  }

  const { date, score, interviewer, isGoodCandidate, feedback, version, maxScore, decision } = data;

  return (
    <Flex vertical gap="0.5em">
      <Space align="center">
        <DecisionTag decision={decision as Decision} />
        <Rating rating={getRating(score, maxScore, version)} />
      </Space>
      <Text>Date: {formatDate(date)}</Text>
      <IsGoodCandidateWidget isGoodCandidate={isGoodCandidate} />
      <InterviewerWidget interviewer={interviewer} />
      {version === 0 && <LegacyScreeningFeedback feedback={feedback as LegacyFeedback} />}
      {version === 1 && <PrescreeningFeedback feedback={feedback} />}
    </Flex>
  );
}

export default function InterviewModal({ isVisible, onHide, coreJs, prescreening }: InterviewModalProps) {
  const title = coreJs
    ? `${coreJs.data.courseFullName} CoreJS Interview Feedback`
    : `${prescreening?.data.courseFullName} Pre-Screening Interview Feedback`;
  return (
    <Modal title={title} open={isVisible} onCancel={onHide} footer={null} width="80%">
      {coreJs && renderCoreJsModal(coreJs)}
      {prescreening && renderPreScreeningModal(prescreening)}
    </Modal>
  );
}
