import { Form, Input, Typography, Modal } from 'antd';
import { JoinTeamDto } from 'api';
import { passwordPattern } from 'services/validators';

type Props = {
  onCancel: () => void;
  onSubmit: (id: number, record: JoinTeamDto) => Promise<void>;
};

const { Text } = Typography;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export default function JoinTeamModal({ onCancel, onSubmit }: Props) {
  const [form] = Form.useForm<Partial<JoinTeamDto>>();

  const handleModalSubmit = async (values: Partial<JoinTeamDto>) => {
    const [id, password] = values.password!.split('_');

    if (!password || !Number(id)) {
      return;
    }
    await onSubmit(Number(id), { password });
  };

  return (
    <Modal
      style={{ top: 20 }}
      width={756}
      open={true}
      title="Join team"
      okText="Join"
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
      <Form {...layout} form={form}>
        <Text>
          You're joining to the team for group task solving. Enter the invitation password you've received from the team
          lead.
        </Text>
        <Form.Item
          style={{ marginTop: 16 }}
          name="password"
          label="Team password"
          rules={[
            { required: true, message: 'Please enter team password' },
            { message: 'Please enter valid password', pattern: passwordPattern },
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
}
