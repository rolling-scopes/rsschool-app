import { Button, Drawer, Form, InputNumber, Select, Alert } from 'antd';
import { CourseTask, CourseService } from 'services/course';
import { useState } from 'react';
import { useAsync } from 'react-use';

type Props = {
  courseId: number;
  onApply: (criteria: { courseTaskIds: number[]; minScore: number; minTotalScore: number }) => void;
  onClose: () => void;
};

export function CertificateCriteria(props: Props) {
  const [courseTasks, setCourseTasks] = useState<CourseTask[]>([]);
  const [applyEnabled, setApplyEnabled] = useState(false);

  useAsync(async () => {
    const courseTasks = await new CourseService(props.courseId).getCourseTasks();
    setCourseTasks(courseTasks);
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
          onValuesChange={(changes: any, values: any) => {
            const { minScore, courseTaskIds } = values as FormValues;
            const formChanges = changes as FormValues;
            if (formChanges.minScore === undefined && formChanges.courseTaskIds === undefined) {
              return;
            }
            setApplyEnabled(!!minScore || (Array.isArray(courseTaskIds) && courseTaskIds.length > 0));
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
          <Form.Item name="minTotalScore" rules={[{ required: true }]} label="Min total score">
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
};
