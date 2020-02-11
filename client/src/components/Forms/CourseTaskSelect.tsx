import * as React from 'react';
import { Select, Form } from 'antd';
import { CourseTask } from 'services/course';

type Props = { data: CourseTask[]; onChange?: (id: number) => void };

export function CourseTaskSelect(props: Props) {
  const { data, onChange, ...rest } = props;
  const selectProps = onChange ? { onChange } : {};
  return (
    <Form.Item {...rest} name="courseTaskId" label="Task" rules={[{ required: true, message: 'Please select a task' }]}>
      <Select placeholder="Select task" {...selectProps}>
        {data.map(task => (
          <Select.Option key={task.id} value={task.id}>
            {task.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
