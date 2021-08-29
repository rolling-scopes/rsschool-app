import { useEffect, useMemo, useState } from 'react';
import { Form, Input, Select } from 'antd';
import { UserSearch } from '../../../components';
import { tags } from '../data/tags';
import { UserService } from '../../../services/user';
import { IForm } from '../../../services/bestWork';
import { CourseService, CourseTask } from '../../../services/course';
import { IModalAddBestWorkProps } from './BestWorkModal';

type BestWorkFormProps = Omit<IModalAddBestWorkProps, 'isModalVisible'>;

const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};

export function BestWorkForm({ work, courses, finishHandler, setIsModalVisible }: BestWorkFormProps) {
  const userService = useMemo(() => new UserService(), []);
  const [course, setCourse] = useState<number>();
  const [tasks, setTasks] = useState<CourseTask[]>([]);
  const courseService = useMemo(() => new CourseService(work?.course || course!), [course, work]);

  const [form] = Form.useForm();

  async function getTasks() {
    const courseTasks = await courseService.getCourseTasks('finished');
    setTasks(courseTasks);
  }

  useEffect(() => {
    if (work) {
      const fields = { ...work, users: work.users.map(u => u.id) };
      form.setFieldsValue(fields);
    }
  }, [work]);

  useEffect(() => {
    if (course || work?.course) getTasks();
  }, [course, work]);

  const onFinish = async (values: IForm) => {
    await finishHandler({ ...values, course: course! });
    form.resetFields();
    setIsModalVisible(false);
  };

  function courseHandler(course: number) {
    setCourse(course);
  }

  const loadUsers = async (searchText: string) => userService.searchUser(searchText);

  return (
    <Form {...formItemLayout} id="addBestWorkForm" form={form} onFinish={onFinish}>
      <Form.Item name="course" label="Course" rules={[{ required: true, message: 'Please select an task' }]}>
        <Select onChange={courseHandler}>
          {courses.map(e => (
            <Option value={e.id} key={e.id}>
              {e.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="task" label="Task" rules={[{ required: true, message: 'Please select an task' }]}>
        <Select>
          {tasks.map(e => (
            <Option value={e.taskId} key={e.id}>
              {e.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="users" label="Users" rules={[{ required: true, message: 'Please select an user' }]}>
        <UserSearch defaultValues={work?.users} keyField="id" searchFn={loadUsers} mode="multiple" />
      </Form.Item>
      <Form.Item
        name="projectUrl"
        label="Project URL"
        rules={[{ required: true, message: 'Please enter project url' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="imageUrl" label="Image URL" rules={[{ required: true, message: 'Please enter image url' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="tags" label="Tags" rules={[{ required: true, message: 'Please select an tags' }]}>
        <Select mode="multiple">
          {Object.keys(tags).map((e, i) => (
            <Option value={e} key={i}>
              {tags[e]}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );
}
