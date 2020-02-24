import * as React from 'react';
// import isEqual from 'lodash/isEqual'
import { CoreJsInterviewData } from './CoreJsIviewsCard';
import { Modal, Table, Typography, Tag } from 'antd';

const { Text } = Typography;

type Props = {
  stats: CoreJsInterviewData;
  isVisible: boolean;
  onHide: () => void;
};

class CoreJsIviewsModal extends React.PureComponent<Props> {
  render() {
    const { stats, isVisible, onHide } = this.props;
    const { courseFullName, interview } = stats;
    const { score, comment, answers, interviewer } = interview;

    return (
      <Modal
        title={`${courseFullName} CoreJS Interview Feedback`}
        visible={isVisible}
        onCancel={onHide}
        footer={null}
        width={'80%'}
      >
        <p style={{ marginBottom: 5 }}>
          Score: <Text mark>{score}</Text>
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
        <Table
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
                answer === 'true' ? (
                  <Tag color="green">Yes</Tag>
                ) : answer === 'false' ? (
                  <Tag color="red">No</Tag>
                ) : (
                  answer
                ),
            },
          ]}
        />
      </Modal>
    );
  }
}

export default CoreJsIviewsModal;
