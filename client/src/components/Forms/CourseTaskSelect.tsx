import * as React from 'react';
import { Select, Form } from 'antd';
import { CourseTask } from 'services/course';

type Props = {
  data: CourseTask[];
  onChange?: (id: number) => void;
  isSubmitted: boolean;
  isActive: boolean;
  isExpired: boolean;
};

const MAX_DATE = '+275760-09-13T00:00:00.000Z';

export function CourseTaskSelect(props: Props) {
  const { data, onChange, isSubmitted, isActive, isExpired, ...options } = props;
  data.sort(function (firstTask, secondTask) {
    return Date.parse(secondTask.studentEndDate ?? MAX_DATE) - Date.parse(firstTask.studentEndDate ?? MAX_DATE);
  });
  const selectProps = { onChange } || {};
  const dataActive = data.filter(task => Date.now() < Date.parse(task.studentEndDate ?? MAX_DATE));
  const dataExpired = data.filter(task => Date.now() >= Date.parse(task.studentEndDate ?? MAX_DATE));

  const selectGroups = [
    { type: isActive, data: dataActive, title: 'Active' },
    { type: isExpired, data: dataExpired, title: 'Expired' },
  ];

  return (
    <Form.Item
      {...options}
      name="courseTaskId"
      label="Task"
      rules={[{ required: true, message: 'Please select a task' }]}
    >
      <Select placeholder="Select task" {...selectProps}>
        {selectGroups.map(
          group =>
            group.type &&
            group.data.length > 0 && (
              <Select.OptGroup label={group.title}>
                {group.data.map(task => (
                  <Select.Option key={task.id} value={task.id}>
                    {task.name}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            ),
        )}
      </Select>
    </Form.Item>
  );
}
