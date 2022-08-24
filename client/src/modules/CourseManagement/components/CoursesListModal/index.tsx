import { Form, Select } from 'antd';
import { CourseDto, CoursesApi } from 'api';
import { ModalForm } from 'components/Forms';
import { useCallback } from 'react';
import { useAsync } from 'react-use';

const { Option } = Select;

type Props = {
  onCancel: () => void;
  onSubmit: (record: Pick<CourseDto, 'id'>) => void;
  data: Partial<Pick<CourseDto, 'id'>> | null;
  okText?: string;
};

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
    (input, option) => {
      if (!input) {
        return false;
      }
      const task = courses.find(t => t.id === option?.value);
      return task?.name.toLowerCase().includes(input.toLowerCase()) ?? false;
    },
    [courses],
  );

  return (
    <ModalForm
      data={props.data}
      okText={props.okText}
      loading={loading}
      title="Courses"
      submit={handleModalSubmit}
      cancel={handleModalCancel}
    >
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

function createRecord(values: any) {
  return { id: values.courseId as number };
}
