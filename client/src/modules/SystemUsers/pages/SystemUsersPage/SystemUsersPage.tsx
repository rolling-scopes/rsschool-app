import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Space, Table, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CreateSystemUserDto, PersonalAccessTokensApi, SystemUserDto, SystemUsersApi } from '@client/api';
import { useMessage } from '@client/hooks';
import { useActiveCourseContext } from '@client/modules/Course/contexts';
import { AdminPageLayout } from '@client/shared/components/PageLayout';

const api = new SystemUsersApi();
const patApi = new PersonalAccessTokensApi();

export function SystemUsersPage() {
  const { courses } = useActiveCourseContext();
  const { message } = useMessage();
  const [users, setUsers] = useState<SystemUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState<{ user: SystemUserDto; token: string } | null>(null);
  const [form] = Form.useForm<CreateSystemUserDto>();

  const reload = async () => {
    setLoading(true);
    try {
      const { data } = await api.getSystemUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const onCreate = async (values: CreateSystemUserDto) => {
    const { data } = await api.createSystemUser(values);
    setCreating(false);
    form.resetFields();
    message.success(`Created system user "${data.githubId}"`);
    void reload();
  };

  const onIssueToken = async (user: SystemUserDto) => {
    const tokenName = `${user.githubId} bootstrap token`;
    const { data } = await patApi.createPersonalAccessTokenForUser(user.id, { name: tokenName });
    setCreatedToken({ user, token: data.token });
  };

  const copyToken = async () => {
    if (!createdToken) return;
    await navigator.clipboard.writeText(createdToken.token);
    message.success('Token copied');
  };

  return (
    <AdminPageLayout title="System users" loading={loading} courses={courses}>
      <Card
        title="Service accounts"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
            New system user
          </Button>
        }
      >
        <Typography.Paragraph type="secondary">
          System users are non-interactive accounts used by automated agents. They cannot sign in via GitHub. Assign
          per-course roles via the regular course management UI; issue API tokens here.
        </Typography.Paragraph>
        <Table<SystemUserDto>
          rowKey="id"
          dataSource={users}
          pagination={false}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 80 },
            { title: 'Login', dataIndex: 'githubId', render: v => <code>{v}</code> },
            { title: 'Name', dataIndex: 'name' },
            { title: 'Created', dataIndex: 'createdDate', render: v => (v ? new Date(v).toLocaleString() : '—') },
            {
              title: 'Actions',
              render: (_, record) => (
                <Button size="small" onClick={() => onIssueToken(record)}>
                  Issue token
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Create system user"
        open={creating}
        onCancel={() => setCreating(false)}
        onOk={() => form.submit()}
        okText="Create"
      >
        <Form form={form} layout="vertical" onFinish={onCreate}>
          <Form.Item name="name" label="Display name" rules={[{ required: true, max: 80 }]}>
            <Input placeholder="e.g. Certificate Issuer Bot" />
          </Form.Item>
          <Form.Item
            name="githubId"
            label='Login (must start with "system:")'
            rules={[{ pattern: /^system:[a-z0-9-]{1,80}$/, message: 'Format: system:<slug>' }]}
          >
            <Input placeholder="system:cert-bot (optional; generated if empty)" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={createdToken ? `Token for ${createdToken.user.githubId}` : ''}
        open={!!createdToken}
        onCancel={() => setCreatedToken(null)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setCreatedToken(null)}>
            I've saved it
          </Button>,
        ]}
      >
        <Typography.Paragraph type="warning">
          This is the only time the token will be shown. Copy and store it in the agent's secret store now.
        </Typography.Paragraph>
        <Space.Compact style={{ width: '100%' }}>
          <Input.Password value={createdToken?.token ?? ''} readOnly />
          <Button onClick={copyToken}>Copy</Button>
        </Space.Compact>
      </Modal>
    </AdminPageLayout>
  );
}
