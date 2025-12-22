import { Row, Space, Table, Typography } from 'antd';
import { StageInterviewDetailedFeedback } from '@common/models/profile';
import { CODING_LEVELS, FeedbackStepId, SKILLS_LEVELS } from 'data/interviews/technical-screening';
import { InterviewFeedbackStepData, InterviewFeedbackValues, InterviewQuestion } from '@common/models';
import { Rating } from '@client/shared/components/Rating';
import { useMemo } from 'react';

const { Text, Title } = Typography;

const STYLES = {
  feedbackItemWidth: '80%',
  skillCommentWidth: '60%',
};

const FEEDBACK_CONFIG = [
  {
    id: 'decision_redFlags',
    label: 'Red flags',
    getValue: (steps: Record<FeedbackStepId, InterviewFeedbackStepData>) => steps.decision.values?.redFlags,
    isRejectedInterviewItem: false,
  },
  {
    id: 'decision_comment',
    label: 'Comment',
    getValue: (steps: Record<FeedbackStepId, InterviewFeedbackStepData>) => steps.decision.values?.comment,
    isRejectedInterviewItem: false,
  },
  {
    id: 'english_certificate',
    label: 'Certified level of English',
    getValue: (steps: Record<FeedbackStepId, InterviewFeedbackStepData>) => steps.english.values?.englishCertificate,
    isRejectedInterviewItem: false,
  },
  {
    id: 'english_selfAssessment',
    label: 'English level by interviewers opinion',
    getValue: (steps: Record<FeedbackStepId, InterviewFeedbackStepData>) => steps.english.values?.selfAssessment,
    isRejectedInterviewItem: false,
  },
  {
    id: 'english_comment',
    label: 'Where did the student learn English',
    getValue: (steps: Record<FeedbackStepId, InterviewFeedbackStepData>) => steps.english.values?.comment,
    isRejectedInterviewItem: false,
  },
  {
    id: 'intro_comment',
    label: 'Comment',
    getValue: (steps: Record<FeedbackStepId, InterviewFeedbackStepData>) => steps.intro.values?.comment,
    isRejectedInterviewItem: true,
  },
];

const FeedbackItem = ({
  label,
  value,
  width = STYLES.feedbackItemWidth,
}: {
  label: string;
  value: unknown;
  width?: string;
}) => {
  if (typeof value === 'string' && value) {
    return (
      <Space direction="vertical" style={{ width }}>
        <Text strong>{label}: </Text>
        <Text>{value}</Text>
      </Space>
    );
  }
  return null;
};

export function PrescreeningFeedback({ feedback }: { feedback: StageInterviewDetailedFeedback['feedback'] }) {
  const { steps } = feedback as { steps: Record<FeedbackStepId, InterviewFeedbackStepData> };
  const { theory, practice } = steps;

  const isRejected = steps.intro.values?.interviewResult === 'missed';

  const displayItems = useMemo(
    () =>
      FEEDBACK_CONFIG.filter(item => item.isRejectedInterviewItem === isRejected).map(({ id, label, getValue }) => ({
        id,
        label,
        value: getValue(steps),
      })),

    [steps, isRejected],
  );

  return (
    <Space direction="vertical" size={20}>
      {displayItems.map(item => (
        <FeedbackItem key={item.id} label={item.label} value={item.value} />
      ))}
      {!isRejected && (
        <>
          <SkillSection skills={theory.values} title="Theory" tooltips={SKILLS_LEVELS} />
          <SkillSection skills={practice.values} title="Practice" tooltips={CODING_LEVELS} />
        </>
      )}
    </Space>
  );
}

function SkillSection({
  skills,
  title,
  tooltips,
}: {
  skills: InterviewFeedbackValues | undefined;
  title: string;
  tooltips: string[];
}) {
  if (!skills) return null;

  return (
    <Space direction="vertical">
      <Title level={4}>{title}</Title>
      <SkillTable skills={skills.questions as InterviewQuestion[]} tooltips={tooltips} />
      <FeedbackItem label="Comment" value={skills?.comment} width={STYLES.skillCommentWidth} />
    </Space>
  );
}

function SkillTable({ skills, tooltips }: { skills: InterviewQuestion[]; tooltips: string[] }) {
  return (
    <Table
      dataSource={skills}
      size="small"
      rowKey="id"
      pagination={false}
      columns={[
        {
          width: '60%',
          render: (_, record) => (
            <>
              {record.topic && (
                <Row>
                  <Text type="secondary">{record.topic}</Text>
                </Row>
              )}
              <Text>{record.title}</Text>
            </>
          ),
        },
        {
          dataIndex: 'value',
          render: rating => <Rating rating={rating} tooltips={tooltips} />,
        },
      ]}
    />
  );
}
