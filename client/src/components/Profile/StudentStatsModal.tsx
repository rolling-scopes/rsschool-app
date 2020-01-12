import * as React from 'react';
import { StudentStats } from '../../../../common/models/profile';
import {
  Modal,
  Table,
  Typography,
  Progress,
  Row,
  Col,
} from 'antd';

const { Text } = Typography;

type Props = {
  stats: StudentStats;
  courseProgress: number;
  isVisible: boolean;
  onHide: () => void;
};

class StudentStatsModal extends React.Component<Props> {
  render() {
    const { stats, courseProgress } = this.props;
    const { tasks, courseFullName, mentor, totalScore, isExpelled, position } = stats;
    const courseTasks = tasks.map((task, idx) => ({ key: `student-stats-modal-task-${idx}`, ...task }));
    const maxCourseScore = tasks.every(({ maxScore }) => maxScore) ?
      tasks.map(({ maxScore, scoreWeight }) => maxScore * scoreWeight).reduce((acc, cur) => acc + cur) :
      null;

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
              status={isExpelled ? 'exception' : undefined}
              type="circle"
              width={80}
            />
          </Col>
          <Col>
            {
              mentor.githubId && <p style={{ marginBottom: 5 }}>
                Mentor: <a href={`/profile?githubId=${mentor.githubId}`}>{mentor.name}</a>
              </p>
            }
            {
              position && <p style={{ marginBottom: 5 }}>
                Position: <Text strong>{position}</Text>
              </p>
            }
            <p style={{ marginBottom: 30 }}>
              Total Score: <Text mark>{totalScore}</Text>{maxCourseScore && ` / ${maxCourseScore}`}
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
              render: (task: string, { descriptionUri }: any) => (descriptionUri ?
                <a href={descriptionUri} target="_blank">{task}</a>
                : task),
              ellipsis: true,
            },
            {
              title: 'Score / Max [*Weight]',
              dataIndex: 'score',
              render: (score: string, { maxScore, scoreWeight }: any) => (
                <>
                  <Text strong>
                    {score ? score : '-'}
                  </Text> / {maxScore ? maxScore : '-'
                  } <Text style={{ fontSize: 10, verticalAlign: 'top' }}>
                    [*{scoreWeight}{score ? <Text> = <Text strong>{Number(score) * scoreWeight}</Text></Text> : ''}]
                  </Text>
                </>
              ),
              ellipsis: true,
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
