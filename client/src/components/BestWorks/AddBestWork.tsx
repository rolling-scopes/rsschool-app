import { Button, Form, Input, Modal, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { UserSearch } from '../UserSearch';
import { UserService } from '../../services/user';
import { BestWorkService } from '../../services/bestWork';
import { CourseTask } from '../../services/course';

const { Option } = Select;

interface IAddBestWorkProps {
  course: number;
  tasks: CourseTask[];
}

export interface IForm {
  githubId: string[];
  task: number;
  imageUrl: string;
  tags: string[];
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

export function AddBestWork({ course, tasks }: IAddBestWorkProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const bestWorkService = useMemo(() => new BestWorkService(), []);
  const userService = useMemo(() => new UserService(), []);

  const [form] = Form.useForm();

  const onFinish = async (values: IForm) => {
    const result = await bestWorkService.postBestWork({ ...values, course });
    form.resetFields();
    setIsModalVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const loadUsers = async (searchText: string) => userService.searchUser(searchText);

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        icon={<PlusOutlined />}
        style={{ position: 'fixed', bottom: '50px', right: '50px' }}
        size={'large'}
        onClick={showModal}
      />
      <Modal
        title="Basic Modal"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button onClick={handleCancel} key="cancel">
            Cancel
          </Button>,
          <Button form="addBestWorkForm" key="submit" htmlType="submit" type={'primary'}>
            Save
          </Button>,
        ]}
      >
        <Form {...formItemLayout} id="addBestWorkForm" form={form} onFinish={onFinish}>
          <Form.Item name="githubId" label="Users" rules={[{ required: true, message: 'Please select an user' }]}>
            <UserSearch keyField="githubId" searchFn={loadUsers} selectType="multiple" />
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
    </>
  );
}
