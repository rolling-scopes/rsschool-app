import * as React from 'react';
import { Modal, Tag, Typography, Table } from 'antd';
import { formatDate } from 'services/formatter';
import { Rating } from 'components';
import { StageInterviewDetailedFeedback } from '../../../../common/models/profile';
import { CODING_LEVELS, SKILLS_LEVELS, SKILL_NAME } from 'services/reference-data/stageInterview';

const { Text } = Typography;

type Props = {
  feedback: StageInterviewDetailedFeedback;
  isVisible: boolean;
  onHide: () => void;
};

class PreScreeningIviewModal extends React.PureComponent<Props> {
  render() {
    const { feedback, isVisible, onHide } = this.props;
    const {
      courseName,
      courseFullName,
      date,
      rating,
      interviewer,
      isGoodCandidate,
      comment,
      skills,
      programmingTask,
      english,
    } = feedback;
    const skillSet = [
      ...(Object.keys(skills) as any[]).map((key: keyof typeof skills) => ({
        rating: skills[key],
        name: SKILL_NAME[key],
        key: `stageInterview-${courseName}-${date}-skills-${key}`,
        isNotCodeWritingLevel: true,
      })),
      {
        rating: programmingTask.codeWritingLevel,
        name: 'Code writing level',
        key: `stageInterview-${courseName}-${date}-skills-codeWritingLevel`,
        isNotCodeWritingLevel: false,
      },
    ];

    return (
      <Modal
        title={`${courseFullName} Pre-Screening Interview Feedback`}
        visible={isVisible}
        onCancel={onHide}
        footer={null}
        width={'80%'}
      >
        <Rating rating={rating} />
        <p style={{ marginBottom: 5 }}>Date: {formatDate(date)}</p>
        <p style={{ marginBottom: 5 }}>
          Good candidate: {isGoodCandidate ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
        </p>
        <p style={{ marginBottom: 20 }}>
          Interviewer: <a href={`/profile?githubId=${interviewer.githubId}`}>{interviewer.name}</a>
        </p>
        {comment && (
          <p style={{ marginBottom: 20 }}>
            <Text strong>Comment: </Text>
            {comment}
          </p>
        )}
        <p style={{ marginBottom: 5 }}>
          Programming task(s): <Text code>{programmingTask.task}</Text>
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
        <p style={{ marginBottom: 5 }}>Estimated English level: {english.toUpperCase()}</p>
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
      </Modal>
    );
  }
}

export default PreScreeningIviewModal;
