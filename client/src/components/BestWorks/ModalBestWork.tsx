import { Button, Form, Input, Modal, Select } from 'antd';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { UserService } from '../../services/user';
import { CourseService, CourseTask } from '../../services/course';
import { IForm, IPostBestWork } from '../../services/bestWork';
import { IBestWork } from '../../pages/best-works';
import { UserSearch } from '../UserSearch';

const { Option } = Select;

interface IModalAddBestWork {
  course: number;
  isModalVisible: boolean;
  finishHandler: (values: IPostBestWork) => Promise<void>;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
  work?: IBestWork;
}

type tagsType = {
  [x: string]: string;
};

const tags: tagsType = {
  html: 'HTML',
  css: 'CSS',
  js: 'JavaScript',
  react: 'React',
  angular: 'Angular',
  node: 'NodeJS',
};

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

export function ModalBestWork({ course, finishHandler, isModalVisible, setIsModalVisible, work }: IModalAddBestWork) {
  const [tasks, setTasks] = useState<CourseTask[]>([]);
  const userService = useMemo(() => new UserService(), []);
  const courseService = useMemo(() => new CourseService(course), [course]);

  const [form] = Form.useForm();

  const onFinish = async (values: IForm) => {
    await finishHandler({ ...values, course });
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

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
    getTasks();
  }, [course]);

  const loadUsers = async (searchText: string) => userService.searchUser(searchText);

  return (
    <Modal
      title="Basic Modal"
      visible={isModalVisible}
      onCancel={handleCancel}
      footer={[
        <Button onClick={handleCancel} key="cancel">
          Cancel
        </Button>,
        <Button form="addBestWorkForm" key="submit" htmlType="submit" type="primary">
          Save
        </Button>,
      ]}
    >
      <Form {...formItemLayout} id="addBestWorkForm" form={form} onFinish={onFinish}>
        <Form.Item name="users" label="Users" rules={[{ required: true, message: 'Please select an user' }]}>
          <UserSearch defaultValues={work?.users} keyField="id" searchFn={loadUsers} mode="multiple" />
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
    </Modal>
  );
}
