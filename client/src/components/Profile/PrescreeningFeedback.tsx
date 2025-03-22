import { Typography, Table, Row, Space } from 'antd';
import { Rating } from 'components/Rating';
import { StageInterviewDetailedFeedback } from '@common/models/profile';
import {
  CODING_LEVELS,
  FeedbackStepId,
  InterviewFeedbackStepData,
  InterviewFeedbackValues,
  InterviewQuestion,
  SKILLS_LEVELS,
} from 'data/interviews/technical-screening';

const { Text, Title } = Typography;

export function PrescreeningFeedback({ feedback }: { feedback: StageInterviewDetailedFeedback['feedback'] }) {
  const { steps } = feedback as { steps: Record<FeedbackStepId, InterviewFeedbackStepData> };

  const { theory, practice, english, decision, intro } = steps;
  const isRejected = intro.values?.interviewResult === 'missed';

  if (isRejected) {
    return (
      <Space direction="vertical">
        {intro.values?.comment && (
          <Space>
            <Text strong>Comment: </Text>
            <Text>{intro.values?.comment as string} </Text>
          </Space>
        )}
      </Space>
    );
  }

  return (
    <>
      <Space direction="vertical">
        {decision.values?.redFlags && (
          <Space>
            <Text strong>Red flags: </Text>
            <Text>{decision.values?.redFlags as string} </Text>
          </Space>
        )}
        {decision.values?.comment && (
          <Space>
            <Text strong>Comment: </Text>
            <Text>{decision.values?.comment as string} </Text>
          </Space>
        )}
        {english.values && (
          <>
            <Space>
              <Text strong>Certified level of English: </Text>
              <Text>{english.values?.englishCertificate as string} </Text>
            </Space>
            <Space>
              <Text strong>English level by interviewers opinion:</Text>
              <Text>{english.values?.selfAssessment as string} </Text>
            </Space>
          </>
        )}
        {english.values?.comment && (
          <Space>
            <Text strong>Where did the student learn English: </Text>
            <Text>{english.values?.comment as string} </Text>
          </Space>
        )}
        <SkillSection skills={theory.values} title="Theory" tooltips={SKILLS_LEVELS} />
        <SkillSection skills={practice.values} title="Practice" tooltips={CODING_LEVELS} />
      </Space>
    </>
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
    <Space direction="vertical" style={{ marginBottom: 20, width: '100%' }}>
      <Title level={4}>{title}</Title>
      <SkillTable skills={skills.questions as InterviewQuestion[]} tooltips={tooltips} />
      {skills.comment && (
        <Row>
          <Text strong>Comment: </Text>&nbsp;{skills.comment as string}
        </Row>
      )}
    </Space>
  );
}

function SkillTable({ skills, tooltips }: { skills: InterviewQuestion[]; tooltips: string[] }) {
  return (
    <Table
      dataSource={skills}
      size="small"
      rowKey="key"
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
