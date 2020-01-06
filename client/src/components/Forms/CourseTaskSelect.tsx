import * as React from 'react';
import { Select, Form } from 'antd';
import { CourseTask } from 'services/course';

type Props = { data: CourseTask[]; onChange: any };

export function CourseTaskSelect(props: Props) {
  const { data, onChange, ...rest } = props;
  return (
    <Form.Item {...rest} name="courseTaskId" label="Task" rules={[{ required: true, message: 'Please select a task' }]}>
      <Select placeholder="Select task" onChange={onChange}>
        {data.map(task => (
          <Select.Option key={task.id} value={task.id}>
            {task.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
