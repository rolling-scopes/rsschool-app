import { Form, Select } from 'antd';
import { CourseDto, CoursesApi } from '@client/api';
import { ModalForm } from '@client/shared/components/Forms';
import { useCallback, PropsWithChildren } from 'react';
import { useAsync } from 'react-use';

const { Option } = Select;

type Props = PropsWithChildren<{
  onCancel: () => void;
  onSubmit: (record: Pick<CourseDto, 'id'>) => void;
  data: Partial<Pick<CourseDto, 'id'>> | null;
  okText?: string;
}>;

const coursesApi = new CoursesApi();

export function CoursesListModal(props: Props) {
  const { loading, value } = useAsync(() => coursesApi.getCourses(), []);

  const courses = value?.data ?? [];

  const handleModalSubmit = async (values: any) => {
    const record = createRecord(values);
    props.onSubmit(record);
  };

  const handleModalCancel = () => {
    props.onCancel();
  };

  const filterOption = useCallback(
    (input: string, option?: { value: number }): boolean => {
      if (!input) {
        return false;
      }
      const task = courses.find(t => t.id === Number(option?.value));
      return task?.name.toLowerCase().includes(input.toLowerCase()) ?? false;
    },
    [courses],
  );

  if (!props.data) {
    return null;
  }

  return (
    <ModalForm
      data={props.data}
      okText={props.okText}
      loading={loading}
      title="Courses"
      submit={handleModalSubmit}
      cancel={handleModalCancel}
    >
      {props.children}
      <Form.Item name="courseId" label="Course" rules={[{ required: true, message: 'Please select a course' }]}>
        <Select filterOption={filterOption} showSearch placeholder="Please select a course">
          {courses.map(task => (
            <Option key={task.id} value={task.id}>
              {task.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </ModalForm>
  );
}

function createRecord(values: { courseId: number }) {
  return { id: values.courseId };
}
