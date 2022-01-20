import * as React from 'react';
import { Select, Form } from 'antd';
import { CourseTask } from 'services/course';

type Props = { data: CourseTask[]; onChange?: (id: number) => void };

export function CourseTaskSelect(props: Props) {
  const { data, onChange, ...rest } = props;
  data.sort(function (a, b) {
    return Date.parse(b.studentEndDate ?? '') - Date.parse(a.studentEndDate ?? '');
  });
  const selectProps = onChange ? { onChange } : {};
  return (
    <Form.Item {...rest} name="courseTaskId" label="Task" rules={[{ required: true, message: 'Please select a task' }]}>
      <Select placeholder="Select task" {...selectProps}>
        <Select.OptGroup label="Active">
          {data
            .filter(task => Date.now() < Date.parse(task.studentEndDate ?? ''))
            .map(task => (
              <Select.Option key={task.id} value={task.id}>
                {task.name}
              </Select.Option>
            ))}
        </Select.OptGroup>
        <Select.OptGroup label="Expired">
          {data
            .filter(task => Date.now() >= Date.parse(task.studentEndDate ?? ''))
            .map(task => (
              <Select.Option key={task.id} value={task.id}>
                {task.name}
              </Select.Option>
            ))}
        </Select.OptGroup>
      </Select>
    </Form.Item>
  );
}
