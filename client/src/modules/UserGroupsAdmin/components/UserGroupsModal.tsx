import { Col, Form, Input, Row, Select } from 'antd';
import { ModalForm } from '@client/shared/components/Forms';
import { UserGroupDto, UpdateUserGroupDto } from '@client/api';
import { UserSearch } from '@client/shared/components/UserSearch';
import { CourseRole } from 'services/models';

type Props = {
  data: Partial<UserGroupDto> | null;
  title: string;
  submit: (values: UpdateUserGroupDto) => Promise<void>;
  cancel: () => void;
  getInitialValues: (data: Partial<UserGroupDto>) => any;
  loading: boolean;
  loadUsers: (searchText: string) => Promise<any>;
};

const roles = [CourseRole.Manager, CourseRole.Supervisor, CourseRole.Dementor];

export function UserGroupsModal({ data, title, submit, cancel, getInitialValues, loading, loadUsers }: Props) {
  return data ? (
    <ModalForm
      data={data}
      title={title}
      submit={submit}
      cancel={cancel}
      getInitialValues={getInitialValues}
      loading={loading}
    >
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter user group name' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="users" label="Users" rules={[{ required: true, message: 'Please select users' }]}>
            <UserSearch mode="multiple" searchFn={loadUsers} defaultValues={data?.users} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="roles" label="Roles" rules={[{ required: true, message: 'Please select permissions' }]}>
            <Select mode="tags">
              {roles.map(role => (
                <Select.Option key={role} value={role}>
                  {role}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </ModalForm>
  ) : null;
}
