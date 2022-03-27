import { Alert, Button, Drawer, Form, InputNumber, Select } from 'antd';
import { CoursesTasksApi } from 'api';
import { useState } from 'react';
import { useAsync } from 'react-use';

type Props = {
  courseId: number;
  onApply: (criteria: { courseTaskIds: number[]; minScore: number; minTotalScore: number }) => void;
  onClose: () => void;
};

const courseTasksApi = new CoursesTasksApi();

export function CertificateCriteria(props: Props) {
  const [applyEnabled, setApplyEnabled] = useState(false);

  const { value: courseTasks = [] } = useAsync(async () => {
    const { data } = await courseTasksApi.getCourseTasks(props.courseId);
    return data;
  }, []);

  const [form] = Form.useForm();
  return (
    <Drawer
      width={600}
      title="Certificate Criteria"
      placement="right"
      closable={false}
      onClose={props.onClose}
      visible={!!courseTasks}
    >
      <div>
        <Form
          layout="vertical"
          form={form}
          onValuesChange={(_: any, values: any) => {
            const { minScore, courseTaskIds, minTotalScore } = values as FormValues;
            const tasksCriteriaValid =
              !courseTaskIds || !courseTaskIds.length || (courseTaskIds.length > 0 && !!minScore);
            setApplyEnabled(tasksCriteriaValid && !!minTotalScore);
          }}
          onFinish={values => {
            const { minScore, courseTaskIds, minTotalScore } = values;
            props.onApply({ courseTaskIds, minScore, minTotalScore });
          }}
        >
          <Alert
            style={{ marginBottom: 8 }}
            message="It will issue certificates to students who have completed all the tasks from the selected ones, scored more than the specified score and have an overall score greater than the specified one."
          />

          <Form.Item name="courseTaskIds" label="Tasks">
            <Select mode="multiple">
              {courseTasks.map(task => (
                <Select.Option key={task.id} value={task.id}>
                  {task.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="minScore" label="Min score for tasks">
            <InputNumber />
          </Form.Item>
          <Form.Item name="minTotalScore" label="Min total score">
            <InputNumber />
          </Form.Item>
          <Button disabled={!applyEnabled} htmlType="submit" type="primary">
            Apply
          </Button>
        </Form>
      </div>
    </Drawer>
  );
}

type FormValues = {
  courseTaskIds: string[];
  minScore: number;
  minTotalScore: number;
};
