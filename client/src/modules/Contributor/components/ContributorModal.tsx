import { Form, Input, message, Modal, Spin } from 'antd';
import { ContributorDto, ContributorsApi, UsersApi } from 'api';
import useRequest from 'ahooks/lib/useRequest';
import { UserSearch } from 'components/UserSearch';

type Props = {
  contributorId: number | null;
  onClose: () => void;
};
const api = new ContributorsApi();
const usersApi = new UsersApi();

type FormData = {
  user: { id: number };
  description: string;
};

export function ContributorModal(props: Props) {
  const [form] = Form.useForm<FormData>();

  const initial = useRequest<Partial<ContributorDto>, []>(async () => {
    if (!props.contributorId) {
      return {};
    }
    const response = await api.getContributor(props.contributorId);
    return response.data;
  });

  const submitForm = async () => {
    try {
      const value = await form.validateFields();
      const record = {
        description: value.description,
        userId: value.user.id,
      };
      if (props.contributorId) {
        await api.updateContributor(props.contributorId, record);
      } else {
        await api.createContributor(record);
      }
      props.onClose();
    } catch {
      message.error('Something went wrong. Please try again later.');
    }
  };

  const loadUsers = async (searchText: string) => {
    const { data } = await usersApi.searchUsers(searchText);
    return data;
  };

  const user = initial.data?.user
    ? { ...initial.data?.user, name: `${initial.data.user.firstName} ${initial.data.user.lastName}` }
    : null;

  return (
    <Modal
      title={props.contributorId ? 'Edit Contributor' : 'Add Contributor'}
      open={true}
      onCancel={props.onClose}
      onOk={submitForm}
      okButtonProps={{ loading: initial.loading, disabled: initial.loading }}
      okText="Save"
    >
      {initial.loading ? <Spin spinning /> : null}
      {initial.data ? (
        <Form layout="vertical" form={form} initialValues={initial.data}>
          <Form.Item name={['user', 'id']} label="User" rules={[{ required: true }]}>
            <UserSearch defaultValues={user ? [user] : []} searchFn={loadUsers} />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
        </Form>
      ) : null}
    </Modal>
  );
}
