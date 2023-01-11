import { Form, Input, Space, Typography } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import Modal from 'antd/lib/modal/Modal';
import { TeamApi, TeamDto } from 'api';
import { urlPattern } from 'services/validators';

type Props = {
  data: Partial<TeamDto>;
  onCancel: () => void;
};

const { Text } = Typography;

const teamApi = new TeamApi();

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 20 },
};

export default function TeamModal({ data, onCancel }: Props) {
  const [form] = Form.useForm<Partial<TeamDto>>();

  const handleModalSubmit = (values: Partial<TeamDto>) => {
    return values;
  };

  return (
    <Modal
      style={{ top: 20 }}
      width={756}
      open={true}
      title="Create team"
      onOk={async e => {
        e.preventDefault();
        const values = await form.validateFields().catch(() => null);
        if (values == null) {
          return;
        }
        handleModalSubmit(values);
      }}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
    >
      <Form {...layout} initialValues={data} form={form}>
        <Text>You're creating the team for solving a group task. Fill out the form to invite new members.</Text>
        <Form.Item
          style={{ marginTop: 16 }}
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter team name' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter team description' }]}
        >
          <TextArea showCount maxLength={600} />
        </Form.Item>
        <Space direction="vertical">
          <Text>
            The only person who creates the team is the team leader, who shares the team password with the other
            participants.
          </Text>
          <Text>Provide link to the group chat to Discord and create a specify password</Text>
        </Space>
        <Form.Item
          name="chatLink"
          label="Link to Discord server"
          rules={[
            { required: true, message: 'Please enter link' },
            { message: 'Please enter valid URL', pattern: urlPattern },
          ]}
          style={{ marginTop: 16 }}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
