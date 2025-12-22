import { Tag, Typography, Table } from 'antd';
import { LegacyFeedback } from '@common/models/profile';
import { ENGLISH_LEVELS } from 'data/english';
import { CODING_LEVELS, SKILLS_LEVELS } from 'data/interviews/technical-screening';
import { Rating } from '@client/shared/components/Rating';

const { Text } = Typography;

enum SKILL_NAME {
  htmlCss = 'HTML/CSS',
  dataStructures = 'Data structures',
  common = 'Common of CS / Programming',
}

/**
 * this feedback template will live here until we will migrate all feedbacks to new template
 */
export function LegacyScreeningFeedback({ feedback }: { feedback: LegacyFeedback }) {
  const { comment, skills, programmingTask, english } = feedback;

  const skillSet = [
    ...(Object.keys(skills) as any[]).map((key: keyof typeof skills) => ({
      rating: skills[key],
      name: SKILL_NAME[key],
      key,
      isNotCodeWritingLevel: true,
    })),
    {
      rating: programmingTask.codeWritingLevel,
      name: 'Code writing level',
      key: 'codeWritingLevel',
      isNotCodeWritingLevel: false,
    },
  ];
  const englishLevel = typeof english === 'number' ? ENGLISH_LEVELS[english] : english;

  return (
    <>
      {comment && (
        <p style={{ marginBottom: 20 }}>
          <Text strong>Comment: </Text>
          {comment}
        </p>
      )}
      <p style={{ marginBottom: 5 }}>
        Programming task(s): <br /> <Text code>{programmingTask.task}</Text>
      </p>
      <p style={{ marginBottom: 5 }}>
        Has the student solved the task(s)?{' '}
        {programmingTask.resolved === 1 ? (
          <Tag color="green">Yes</Tag>
        ) : programmingTask.resolved === 2 ? (
          <Tag color="orange">Yes (with tips)</Tag>
        ) : (
          <Tag color="red">No</Tag>
        )}
      </p>
      <p style={{ marginBottom: 5 }}>Comments about coding level: {programmingTask.comment}</p>
      <p style={{ marginBottom: 5 }}>Estimated English level: {englishLevel?.toString().toUpperCase()}</p>
      <Table
        dataSource={skillSet}
        size="small"
        rowKey="key"
        pagination={false}
        columns={[
          {
            dataIndex: 'name',
            ellipsis: true,
            width: '30%',
          },
          {
            dataIndex: 'rating',
            render: (rating, record) => (
              <Rating rating={rating} tooltips={record.isNotCodeWritingLevel ? SKILLS_LEVELS : CODING_LEVELS} />
            ),
          },
        ]}
      />
    </>
  );
}
