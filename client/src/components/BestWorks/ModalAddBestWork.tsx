import { Button, Form, Input, Modal, Select } from 'antd';
import { UserSearch } from '../UserSearch';
import { useMemo } from 'react';
import { UserService } from '../../services/user';
import { CourseTask } from '../../services/course';
import { IForm } from './AddBestWork';
import { FormInstance } from 'antd/es';

const { Option } = Select;

interface IModalAddBestWork {
  tasks: CourseTask[];
  visible: boolean;
  handleCancel: () => void;
  onFinish: (values: IForm) => Promise<void>;
  form: FormInstance;
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

export function ModalAddBestWork({ visible, handleCancel, tasks, onFinish, form }: IModalAddBestWork) {
  const loadUsers = async (searchText: string) => userService.searchUser(searchText);
  const userService = useMemo(() => new UserService(), []);
  return (
    <Modal
      title="Basic Modal"
      visible={visible}
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
          <UserSearch keyField="id" searchFn={loadUsers} selectType="multiple" />
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
