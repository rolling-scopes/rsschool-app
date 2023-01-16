import { Form, Input, Space, Typography } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import Modal from 'antd/lib/modal/Modal';
import { CreateTeamDto, TeamDto } from 'api';
import { urlPattern } from 'services/validators';

type Props = {
  data: Partial<TeamDto>;
  onCancel: () => void;
  onSubmit: (record: CreateTeamDto, id?: number) => Promise<void>;
};

const { Text } = Typography;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 20 },
};

export default function TeamModal({ onCancel, onSubmit, data }: Props) {
  const [form] = Form.useForm<Partial<TeamDto>>();

  const createRecord = (values: Partial<TeamDto>): CreateTeamDto => {
    return {
      name: values.name!,
      description: values.description!,
      chatLink: values.chatLink!,
    };
  };

  const handleModalSubmit = async (values: Partial<TeamDto>) => {
    const record = createRecord(values);
    await onSubmit(record, data?.id);
  };

  return (
    <Modal
      style={{ top: 20 }}
      width={756}
      open={true}
      title={data?.id ? 'Edit Team' : 'Create Team'}
      okText={data?.id ? 'Edit' : 'Create'}
      onOk={async () => {
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
      <Form {...layout} form={form} initialValues={data}>
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
