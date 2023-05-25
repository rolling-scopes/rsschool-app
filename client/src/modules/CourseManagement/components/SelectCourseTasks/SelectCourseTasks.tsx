import { Form, FormItemProps, Select } from 'antd';
import { CoursesTasksApi } from 'api';
import { useAsync } from 'react-use';

type Props = FormItemProps & {
  courseId: number;
};

const courseTasksApi = new CoursesTasksApi();

export function SelectCourseTasks({ courseId, label, ...props }: Props) {
  const { value: courseTasks = [], loading } = useAsync(async () => {
    const { data } = await courseTasksApi.getCourseTasks(courseId);
    return data;
  }, [courseId]);

  return (
    <Form.Item name="courseTaskIds" label={label} style={{ marginBottom: 0 }} {...props}>
      <Select
        mode="multiple"
        placeholder="Select tasks"
        loading={loading}
        optionFilterProp="label"
        options={courseTasks.map(({ name, id }) => ({
          label: name,
          value: id,
        }))}
      />
    </Form.Item>
  );
}
