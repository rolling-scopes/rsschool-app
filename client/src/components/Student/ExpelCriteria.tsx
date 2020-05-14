import { Button, Drawer, Form, Input, InputNumber, Select, Alert, Checkbox } from 'antd';
import { CourseTask, CourseService } from 'services/course';
import { useState } from 'react';
import { useAsync } from 'react-use';

type Props = {
  courseId: number;
  onApply: (
    criteria: { courseTaskIds: number[]; minScore: number },
    options: { keepWithMentor: boolean },
    expellingReason: string,
  ) => void;
  onClose: () => void;
};

export function ExpelCriteria(props: Props) {
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
      title="Expel Criteria"
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
            const { minScore, keepWithMentor, courseTaskIds } = values;
            props.onApply({ courseTaskIds, minScore }, { keepWithMentor }, values.reason);
          }}
        >
          <Alert
            style={{ marginBottom: 8 }}
            message="It will expell students who did not complete any tasks from selected and has score less than entered."
          />
          <Form.Item name="keepWithMentor" valuePropName="checked">
            <Checkbox>Do not exclude students with assigned mentor</Checkbox>
          </Form.Item>

          <Form.Item name="courseTaskIds" label="Tasks">
            <Select mode="multiple">
              {courseTasks.map(task => (
                <Select.Option key={task.id} value={task.id}>
                  {task.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="minScore" label="Min score">
            <InputNumber />
          </Form.Item>
          <Form.Item name="reason" rules={[{ required: true }]} label="Expelling Reason">
            <Input.TextArea />
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
  keepWithMentor: boolean;
};
