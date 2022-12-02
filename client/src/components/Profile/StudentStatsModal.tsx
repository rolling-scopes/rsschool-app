import * as React from 'react';
import { StudentStats } from 'common/models/profile';
import { Modal, Table, Typography, Row, Col } from 'antd';

const { Text } = Typography;

type Props = {
  stats: StudentStats;
  isVisible: boolean;
  onHide: () => void;
};

class StudentStatsModal extends React.PureComponent<Props> {
  render() {
    const { stats } = this.props;
    const { tasks, courseFullName, mentor, totalScore, isExpelled, expellingReason, rank } = stats;
    const courseTasks = tasks.map((task, idx) => ({ key: `student-stats-modal-task-${idx}`, ...task }));
    const maxCourseScore = tasks.every(({ maxScore }) => maxScore)
      ? tasks.map(({ maxScore, scoreWeight }) => maxScore * scoreWeight).reduce((acc, cur) => acc + cur)
      : null;

    return (
      <Modal
        title={`${courseFullName} statistics`}
        open={this.props.isVisible}
        onCancel={this.props.onHide}
        footer={null}
        width={'80%'}
      >
        <Row>
          <Col style={{ marginBottom: 20 }}>
            {mentor.githubId && (
              <p style={{ marginBottom: 5 }}>
                Mentor: <a href={`/profile?githubId=${mentor.githubId}`}>{mentor.name}</a>
              </p>
            )}
            {rank && (
              <p style={{ marginBottom: 5 }}>
                Position: <Text strong>{rank}</Text>
              </p>
            )}
            <p style={{ marginBottom: 5 }}>
              Total Score: <Text mark>{totalScore}</Text>
              {maxCourseScore && ` / ${maxCourseScore.toFixed(1)}`}
            </p>
            {isExpelled && expellingReason && <p style={{ marginBottom: 5 }}>Expelling reason: {expellingReason}</p>}
          </Col>
        </Row>
        <Table
          dataSource={courseTasks}
          size="small"
          rowKey="key"
          pagination={false}
          columns={[
            {
              title: 'Task',
              dataIndex: 'name',
              render: (task: string, { descriptionUri }) =>
                descriptionUri ? (
                  <a href={descriptionUri} target="_blank">
                    {task}
                  </a>
                ) : (
                  task
                ),
            },
            {
              title: 'Score / Max',
              dataIndex: 'score',
              render: (score: string, { maxScore }) => (
                <>
                  <Text strong>{score !== null ? score : '-'}</Text> / {maxScore ? maxScore : '-'}
                </>
              ),
            },
            {
              title: '*Weight',
              dataIndex: 'scoreWeight',
              render: (scoreWeight: number, { score }) => (
                <Text>
                  *{scoreWeight}
                  {score ? (
                    <Text>
                      {' '}
                      = <Text strong>{(Number(score) * scoreWeight).toFixed(2)}</Text>
                    </Text>
                  ) : (
                    ''
                  )}
                </Text>
              ),
            },
            {
              title: 'Comment',
              dataIndex: 'comment',
              ellipsis: true,
            },
            {
              title: 'Github PR Uri',
              dataIndex: 'githubPrUri',
              render: (uri: string) => (uri ? <a href={uri}>PR</a> : uri),
              ellipsis: true,
            },
          ]}
        />
      </Modal>
    );
  }
}

export default StudentStatsModal;
