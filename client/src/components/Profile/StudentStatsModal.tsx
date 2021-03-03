import * as React from 'react';
import { StudentStats } from '../../../../common/models/profile';
import { Modal, Table, Typography, Progress, Row, Col } from 'antd';

const { Text } = Typography;

type Props = {
  stats: StudentStats;
  courseProgress: number;
  scoredTasks: number;
  isVisible: boolean;
  onHide: () => void;
};

class StudentStatsModal extends React.PureComponent<Props> {
  render() {
    const { stats, courseProgress, scoredTasks } = this.props;
    const {
      tasks,
      courseFullName,
      mentor,
      totalScore,
      isExpelled,
      expellingReason,
      position,
      isCourseCompleted,
    } = stats;
    const courseTasks = tasks.map((task, idx) => ({ key: `student-stats-modal-task-${idx}`, ...task }));
    const maxCourseScore = tasks.every(({ maxScore }) => maxScore)
      ? tasks.map(({ maxScore, scoreWeight }) => maxScore * scoreWeight).reduce((acc, cur) => acc + cur)
      : null;

    return (
      <Modal
        title={`${courseFullName} statistics`}
        visible={this.props.isVisible}
        onCancel={this.props.onHide}
        footer={null}
        width={'80%'}
      >
        <Row>
          <Col style={{ marginBottom: 5, marginRight: 20 }}>
            <Progress
              percent={courseProgress}
              status={isExpelled ? 'exception' : isCourseCompleted ? 'success' : undefined}
              type="circle"
              width={80}
            />
          </Col>
          <Col>
            {mentor.githubId && (
              <p style={{ marginBottom: 5 }}>
                Mentor: <a href={`/profile?githubId=${mentor.githubId}`}>{mentor.name}</a>
              </p>
            )}
            {position && (
              <p style={{ marginBottom: 5 }}>
                Position: <Text strong>{position}</Text>
              </p>
            )}
            <p style={{ marginBottom: 5 }}>
              Total Score: <Text mark>{totalScore}</Text>
              {maxCourseScore && ` / ${maxCourseScore.toFixed(1)}`}
            </p>
            {isExpelled && expellingReason && <p style={{ marginBottom: 5 }}>Expelling reason: {expellingReason}</p>}
            <p style={{ marginBottom: 30 }}>
              Course progress: {`${scoredTasks} / ${tasks.length} tasks were scored (${courseProgress}%)`}
            </p>
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
              render: (task: string, { descriptionUri }: any) =>
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
              render: (score: string, { maxScore }: any) => (
                <>
                  <Text strong>{score !== null ? score : '-'}</Text> / {maxScore ? maxScore : '-'}
                </>
              ),
            },
            {
              title: '*Weight',
              dataIndex: 'scoreWeight',
              render: (scoreWeight: number, { score }: any) => (
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
