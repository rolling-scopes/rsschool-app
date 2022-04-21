import * as React from 'react';
import { Select, Form } from 'antd';
import { CourseTaskDto } from 'api';

type Props = {
  data: CourseTaskDto[];
  groupBy?: string;
  onChange?: (id: number) => void;
};

const MAX_DATE = '+275760-09-13T00:00:00.000Z';

export function CourseTaskSelect(props: Props) {
  const { data, groupBy, onChange, ...options } = props;
  const sortedData = data.sort((firstTask, secondTask) =>
    (secondTask.studentEndDate ?? MAX_DATE).localeCompare(firstTask.studentEndDate ?? MAX_DATE),
  );
  const selectProps = onChange ? { onChange } : {};

  const dataActive = sortedData.filter(task => Date.now() < Date.parse(task.studentEndDate ?? MAX_DATE));
  const dataExpired = sortedData.filter(task => Date.now() >= Date.parse(task.studentEndDate ?? MAX_DATE));

  const selectGroups =
    groupBy === 'deadline'
      ? [
          { data: dataActive, title: 'Active' },
          { data: dataExpired, title: 'Expired' },
        ]
      : [{ data: sortedData, title: 'All tasks' }];

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
