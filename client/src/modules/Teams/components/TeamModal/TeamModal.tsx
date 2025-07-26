import { Form, Input, message, Space, Typography, Modal } from 'antd';
import { CreateTeamDto, TeamDto } from 'api';
import { StudentSearch } from 'components/StudentSearch';
import { useLoading } from 'components/useLoading';
import { urlPattern } from 'services/validators';

const { TextArea } = Input;

type Props = {
  data?: Partial<TeamDto>;
  isManager: boolean;
  onCancel: () => void;
  onSubmit: (record: CreateTeamDto, id?: number) => Promise<void>;
  maxStudentsCount: number;
  courseId: number;
  mode: 'create' | 'edit';
};

const { Text } = Typography;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 20 },
};

export default function TeamModal({ onCancel, onSubmit, data, courseId, isManager, maxStudentsCount, mode }: Props) {
  const [form] = Form.useForm<CreateTeamDto>();
  const [loading, withLoading] = useLoading(false);

  const createRecord = ({
    name = 'Team name',
    description = 'Team description',
    chatLink = 'team chat',
    studentIds = [] as number[],
  }): CreateTeamDto => {
    return {
      name: name,
      description: description,
      chatLink: chatLink,
      studentIds: isManager ? studentIds : undefined,
    };
  };

  const handleModalSubmit = withLoading(async (values: CreateTeamDto) => {
    const record = createRecord(values);
    await onSubmit(record, data?.id);
  });

  const handleChangeStudents = (value: number[]) => {
    if (value.length <= maxStudentsCount) {
      form.setFieldsValue({
        studentIds: value,
      });
    } else {
      message.warning(`You can only select a maximum of ${maxStudentsCount} students.`);
    }
  };

  return (
    <Modal
      style={{ top: 20 }}
      width={756}
      open={true}
      title={mode === 'edit' ? 'Edit Team' : 'Create Team'}
      okText={mode === 'edit' ? 'Edit' : 'Create'}
      onOk={async () => {
        const values = await form.validateFields().catch(() => null);
        if (values == null) {
          return;
        }
        handleModalSubmit(values);
      }}
      okButtonProps={{ disabled: loading }}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
    >
      <Form {...layout} form={form} initialValues={data}>
        <Text>You're creating the team for solving a group task. Fill out the form to invite new members.</Text>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter team name' }]}>
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
        {isManager && (
          <Form.Item
            name="studentIds"
            rules={[
              { required: true, message: 'Please select students' },
              {
                validator: (_, value) =>
                  value.length <= maxStudentsCount
                    ? Promise.resolve()
                    : Promise.reject(`You can only select a maximum of ${maxStudentsCount} students.`),
                message: `You can only select a maximum of ${maxStudentsCount} students.`,
              },
            ]}
            label="Students"
            initialValue={mode === 'edit' ? data?.students?.map(s => s.id) : undefined}
          >
            <StudentSearch
              onChange={handleChangeStudents as any}
              keyField="id"
              courseId={courseId}
              mode="multiple"
              defaultValues={data?.students?.map(student => ({
                name: student.fullName,
                id: student.id,
                githubId: student.githubId,
              }))}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
