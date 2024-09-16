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
  const { tableName, tasks, courseName, isVisible, onHide } = props;
  const columnWidth = 150;
  // where 500 is approximate sum of columns
  const tableWidth = 2 * columnWidth + 500;

  return (
    <Modal
      title={`${courseName} statistics`}
      open={isVisible}
      onCancel={onHide}
      footer={null}
      width={'90%'}
      style={{ top: 30 }}
    >
      <p style={{ textAlign: 'center', fontWeight: 700 }}>{tableName.toUpperCase()}</p>
      <Table
        dataSource={tasks}
        size="small"
        rowKey="id"
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
            width: 120,
            dataIndex: 'score',
            render: (score: string, { maxScore }: any) => (
              <>
                <Text strong>{score != null ? score : '-'}</Text> / {maxScore ? maxScore : '-'}
              </>
            ),
          },
          {
            title: 'Weight',
            width: 140,
            dataIndex: 'scoreWeight',
            render: (scoreWeight: number, { score }: any) => (
              <Text>
                {Number(score)} * {scoreWeight}
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
            title: 'Start date',
            width: 140,
            dataIndex: 'startDate',
            render: (startDate: string) => <Text>{dateRenderer(startDate)}</Text>,
          },
          {
            title: 'Deadline',
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
            title: 'Github PR Url',
            dataIndex: 'githubPrUri',
            render: (uri: string) => (uri ? <a href={uri}>PR</a> : uri),
            ellipsis: true,
            width: 120,
          },
        ]}
      />
    </Modal>
  );
}
