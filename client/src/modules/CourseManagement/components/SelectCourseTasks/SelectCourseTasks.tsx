import { Select } from 'antd';
import { CoursesTasksApi } from 'api';
import { useAsync } from 'react-use';

type Props = {
  courseId: number;
};

const courseTasksApi = new CoursesTasksApi();

export function SelectCourseTasks({ courseId }: Props) {
  const { value: courseTasks = [], loading } = useAsync(async () => {
    const { data } = await courseTasksApi.getCourseTasks(courseId);
    return data;
  }, []);

  return (
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
  );
}
