import { useAsync } from 'react-use';
import { Card, Form, Modal, Select, Space, Spin, Typography, message } from 'antd';

import { CoursesTasksApi, TeamDistributionDto } from '@client/api';
import { useActiveCourseContext } from 'modules/Course/contexts';
import { useSubmitTeamScore } from 'modules/TeamDistribution/hooks/useSubmitTeamScore';

const { Text } = Typography;
const { Option } = Select;

type Props = {
  distribution: TeamDistributionDto | null;
  onClose: () => void;
};

const courseTasksApi = new CoursesTasksApi();

export default function SubmitScoreModal({ distribution, onClose }: Props) {
  const { course } = useActiveCourseContext();
  const { loading, handleSubmit, setTaskId, taskId } = useSubmitTeamScore(course.id, distribution?.id ?? 0);

  const fetchCourseTasks = async () => {
    try {
      const { data } = await courseTasksApi.getCourseTasks(course.id);
      return data;
    } catch {
      message.error(`Failed to load tasks for course: ${course.name}`);
    }
  };

  const { value: courseTasks } = useAsync(fetchCourseTasks, []);

  const handleOnCancel = () => {
    setTaskId(null);
    onClose();
  };

  return (
    <Modal
      open={Boolean(distribution)}
      title="Submit Score"
      onOk={handleSubmit}
      onCancel={handleOnCancel}
      okText="Submit score"
      okType="danger"
    >
      <Spin spinning={loading}>
        <Space direction="vertical">
          <Card bordered>
            <Text type="warning" strong>
              After submission, reverting changes will be impossible. Please be careful when selecting the task. The
              same score will be given to all team members.
            </Text>
          </Card>
          <Text strong>Select a task to submit score for all team members:</Text>
          <Form.Item>
            {courseTasks?.length ? (
              <Select
                placeholder="Select task"
                onChange={(value: number) => setTaskId(value)}
                showSearch
                value={taskId}
                optionFilterProp="label"
              >
                {courseTasks.map(task => (
                  <Option key={task.id} value={task.id} label={task.name}>
                    {task.name}
                  </Option>
                ))}
              </Select>
            ) : (
              <Text type="secondary">No tasks found for this course</Text>
            )}
          </Form.Item>
        </Space>
      </Spin>
    </Modal>
  );
}
