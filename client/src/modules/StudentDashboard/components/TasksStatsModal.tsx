import * as React from 'react';
import { Modal, Table, Typography } from 'antd';
import { dateTimeRenderer, dateRenderer } from 'components/Table';
import { TaskStat } from './TasksStatsCard';

const { Text } = Typography;

type Props = {
  courseName: string;
  tableName: string;
  tasks: TaskStat[];
  isVisible: boolean;
  onHide: () => void;
};

export function TasksStatsModal(props: Props) {
  const { tableName, tasks, courseName } = props;
  const courseTasks = tasks.map((task, idx) => ({ key: `student-stats-modal-task-${idx}`, ...task }));
  const columnWidth = 150;
  // where 500 is approximate sum of columns
  const tableWidth = 2 * columnWidth + 500;

  return (
    <Modal
      title={`${courseName} statistics`}
      open={props.isVisible}
      onCancel={props.onHide}
      footer={null}
      width={'90%'}
    >
      <p style={{ textAlign: 'center', fontWeight: 700 }}>{tableName.toUpperCase()}</p>
      <Table
        dataSource={courseTasks}
        size="small"
        rowKey="key"
        scroll={{ x: tableWidth, y: 'calc(100vh - 250px)' }}
        pagination={false}
        columns={[
          {
            title: 'Task',
            fixed: 'left',
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
            width: 70,
            dataIndex: 'score',
            render: (score: string, { maxScore }: any) => (
              <>
                <Text strong>{score != null ? score : '-'}</Text> / {maxScore ? maxScore : '-'}
              </>
            ),
          },
          {
            title: '*Weight',
            width: 70,
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
            width: 140,
            dataIndex: 'startDate',
            render: (startDate: string) => <Text>{dateRenderer(startDate)}</Text>,
          },
          {
            title: '*Deadline',
            width: 140,
            dataIndex: 'endDate',
            render: (endDate: string) => <Text>{dateTimeRenderer(endDate)}</Text>,
          },
          {
            title: 'Comment',
            dataIndex: 'comment',
            ellipsis: false,
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
