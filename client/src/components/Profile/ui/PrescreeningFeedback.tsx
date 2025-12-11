import { Col, Row, Space, Table, Typography } from 'antd';
import { StageInterviewDetailedFeedback } from '@common/models/profile';
import { CODING_LEVELS, FeedbackStepId, SKILLS_LEVELS } from 'data/interviews/technical-screening';
import { InterviewFeedbackStepData, InterviewFeedbackValues, InterviewQuestion } from '@common/models';
import { Rating } from '@client/components/Rating';

const { Text, Title } = Typography;

export function PrescreeningFeedback({ feedback }: { feedback: StageInterviewDetailedFeedback['feedback'] }) {
  const { steps } = feedback as { steps: Record<FeedbackStepId, InterviewFeedbackStepData> };

  const { theory, practice, english, decision, intro } = steps;
  const isRejected = intro.values?.interviewResult === 'missed';

  if (isRejected) {
    return (
      <Space direction="vertical">
        {intro.values?.comment && (
          <Row gutter={8}>
            <Col>
              <Text strong>Comment: </Text>
            </Col>
            <Col>
              <Text>{intro.values?.comment as string} </Text>
            </Col>
          </Row>
        )}
      </Space>
    );
  }

  return (
    <>
      <Space direction="vertical">
        {decision.values?.redFlags && (
          <Row gutter={8}>
            <Col>
              <Text strong>Red flags: </Text>
            </Col>
            <Col>
              <Text>{decision.values?.redFlags as string} </Text>
            </Col>
          </Row>
        )}
        {decision.values?.comment && (
          <Row gutter={8}>
            <Col>
              <Text strong>Comment: </Text>
            </Col>
            <Col>
              <Text>{decision.values?.comment as string} </Text>
            </Col>
          </Row>
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
          <Row gutter={8}>
            <Col>
              <Text strong>Where did the student learn English: </Text>
            </Col>
            <Col>
              <Text>{english.values?.comment as string} </Text>
            </Col>
          </Row>
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
        <Row gutter={8}>
          <Col>
            <Text strong>Comment: </Text>
          </Col>
          <Col>
            <Text>{skills.comment as string}</Text>
          </Col>
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
