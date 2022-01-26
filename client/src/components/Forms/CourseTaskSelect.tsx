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

export function CourseTaskSelect(props: Props) {
  const { data, onChange, isSubmitted, isActive, isExpired, ...rest } = props;
  data.sort(function (a, b) {
    return Date.parse(b.studentEndDate ?? '') - Date.parse(a.studentEndDate ?? '');
  });
  const selectProps = onChange ? { onChange } : {};
  const dataActive = data.filter(task => Date.now() < Date.parse(task.studentEndDate ?? ''));
  const dataSubmitted = dataActive.filter(task => task.id % 2 === 0);
  const dataNotSubmitted = dataActive.filter(task => task.id % 2 === 1);
  const dataExpired = data.filter(task => Date.now() >= Date.parse(task.studentEndDate ?? ''));
  const selectGroups = [
    { type: isSubmitted, data: dataSubmitted, title: 'Submitted' },
    { type: isSubmitted, data: dataNotSubmitted, title: 'Not submitted' },
    { type: isActive, data: dataActive, title: 'Active' },
    { type: isExpired, data: dataExpired, title: 'Expired' },
  ];

  return (
    <Form.Item {...rest} name="courseTaskId" label="Task" rules={[{ required: true, message: 'Please select a task' }]}>
      <Select placeholder="Select task" {...selectProps}>
        {selectGroups.map(group => 
          group.type && group.data.length > 0 && (
            <Select.OptGroup label={group.title}>
              {group.data.map(task => (
                <Select.Option key={task.id} value={task.id}>
                  {task.name}
                </Select.Option>
              ))}
            </Select.OptGroup>
          )
        )}
      </Select>
    </Form.Item>
  );
}
