import * as React from 'react';
import { StudentStats } from '../../../../common/models/profile';
import { Modal, Table, Typography } from 'antd';
import { CourseTask } from 'services/course';
import { dateTimeRenderer, dateRenderer } from 'components/Table';

const { Text } = Typography;

type Props = {
  courseName: string;
  tableName: string;
  tasks: (CourseTask | StudentStats)[];
  isVisible: boolean;
  onHide: () => void;
};

export function TasksStatsModal(props: Props) {
  const { tableName, tasks, courseName } = props;
  const courseTasks = tasks.map((task, idx) => ({ key: `student-stats-modal-task-${idx}`, ...task }));

  return (
    <Modal
      title={`${courseName} statistics`}
      visible={props.isVisible}
      onCancel={props.onHide}
      footer={null}
      width={'80%'}
    >
      <p style={{ textAlign: 'center', fontWeight: 700 }}>{tableName.toUpperCase()}</p>
      <Table
        dataSource={courseTasks}
        size="small"
        rowKey="key"
        pagination={false}
        columns={[
          {
            title: 'Task',
            dataIndex: 'name',
            render: (task: string, { descriptionUrl }: any) =>
              descriptionUrl ? (
                <a href={descriptionUrl} target="_blank">
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
                <Text strong>{score != null ? score : '-'}</Text> / {maxScore ? maxScore : '-'}
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
            title: '*Start date',
            dataIndex: 'studentStartDate',
            render: (startDate: string) => <Text>{dateRenderer(startDate)}</Text>,
          },
          {
            title: '*Deadline',
            dataIndex: 'studentEndDate',
            render: (endDate: string) => <Text>{dateTimeRenderer(endDate)}</Text>,
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
