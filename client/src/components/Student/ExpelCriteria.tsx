import { Button, Drawer, Form, Input, InputNumber, Select, Alert } from 'antd';
import { CourseTask, CourseService } from 'services/course';
import { useState } from 'react';
import { useAsync } from 'react-use';

type Props = {
  courseId: number;
  onApply: (courseTaskIds: number[], minScore: number, expellingReason: string) => void;
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
          onValuesChange={(changes, values: any) => {
            if (changes.minScore === undefined && changes.tasks === undefined) {
              return;
            }
            setApplyEnabled(!!values.minScore || (Array.isArray(values.tasks) && values.tasks.length > 0));
          }}
          onFinish={values => props.onApply(values.tasks, values.minScore, values.reason)}
        >
          <Alert message="It will expell students who did not complete any tasks from selected and has score less than entered." />
          <Alert style={{ marginTop: 8 }} type="warning" message="It won't exclude any students with assigned mentor" />
          <Form.Item name="tasks" label="Tasks">
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
