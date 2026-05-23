import { useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { CopyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  CreatedPersonalAccessTokenDto,
  CreatePersonalAccessTokenDto,
  PersonalAccessTokenDto,
  PersonalAccessTokensApi,
  UsersApi,
} from '@client/api';
import { useMessage } from '@client/hooks';
import { useActiveCourseContext } from '@client/modules/Course/contexts';
import { AdminPageLayout } from '@client/shared/components/PageLayout';
import { UserSearch } from '@client/shared/components/UserSearch';

const api = new PersonalAccessTokensApi();
const usersApi = new UsersApi();

async function searchUsers(value: string) {
  const { data } = await usersApi.searchUsers(value, true);
  return data;
}

export function UserTokensAdminPage() {
  const { courses } = useActiveCourseContext();
  const { message } = useMessage();
  const [userId, setUserId] = useState<number | null>(null);
  const [tokens, setTokens] = useState<PersonalAccessTokenDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [issued, setIssued] = useState<CreatedPersonalAccessTokenDto | null>(null);
  const [form] = Form.useForm<CreatePersonalAccessTokenDto>();

  const load = async (id: number) => {
    setLoading(true);
    try {
      const { data } = await api.getPersonalAccessTokensForUser(id);
      setTokens(data);
      setUserId(id);
    } finally {
      setLoading(false);
    }
  };

  const onRevoke = async (id: string) => {
    await api.revokePersonalAccessTokenAsAdmin(id);
    if (userId !== null) void load(userId);
  };

  const onIssue = async (values: CreatePersonalAccessTokenDto) => {
    if (userId === null) return;
    const { data } = await api.createPersonalAccessTokenForUser(userId, values);
    setIssued(data);
    setIssuing(false);
    form.resetFields();
    void load(userId);
  };

  const copyToken = async () => {
    if (!issued) return;
    await navigator.clipboard.writeText(issued.token);
    message.success('Token copied');
  };

  return (
    <AdminPageLayout title="User API tokens" loading={loading} courses={courses}>
      <Card>
        <Typography.Paragraph type="secondary">
          View, issue, and revoke API tokens of any user, including system accounts. Use this to bootstrap a service
          account, or respond to a leaked token.
        </Typography.Paragraph>
        <Form layout="inline" onFinish={values => load(Number(values.userId))}>
          <Form.Item name="userId" label="User" rules={[{ required: true }]}>
            <UserSearch searchFn={searchUsers} keyField="id" style={{ width: 320 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Load
            </Button>
          </Form.Item>
          {userId !== null && (
            <Form.Item>
              <Button icon={<PlusOutlined />} onClick={() => setIssuing(true)}>
                Issue token
              </Button>
            </Form.Item>
          )}
        </Form>
        <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
          <Table<PersonalAccessTokenDto>
            rowKey="id"
            dataSource={tokens}
            pagination={false}
            columns={[
              { title: 'Name', dataIndex: 'name' },
              { title: 'Prefix', dataIndex: 'prefix', render: v => <code>{v}…</code> },
              { title: 'Created', dataIndex: 'createdAt', render: v => new Date(v).toLocaleString() },
              { title: 'Expires', dataIndex: 'expiresAt', render: v => new Date(v).toLocaleDateString() },
              {
                title: 'Last used',
                dataIndex: 'lastUsedAt',
                render: v => (v ? new Date(v).toLocaleString() : <Tag>never</Tag>),
              },
              {
                title: 'Status',
                dataIndex: 'revokedAt',
                render: v => (v ? <Tag color="red">revoked</Tag> : <Tag color="green">active</Tag>),
              },
              {
                title: 'Actions',
                render: (_, record) =>
                  record.revokedAt ? null : (
                    <Popconfirm title="Revoke this token?" onConfirm={() => onRevoke(record.id)}>
                      <Button danger size="small" icon={<DeleteOutlined />}>
                        Revoke
                      </Button>
                    </Popconfirm>
                  ),
              },
            ]}
          />
        </Space>
      </Card>

      <Modal
        title={userId !== null ? `Issue token for user #${userId}` : 'Issue token'}
        open={issuing}
        onCancel={() => setIssuing(false)}
        onOk={() => form.submit()}
        okText="Issue"
      >
        <Form form={form} layout="vertical" onFinish={onIssue}>
          <Form.Item name="name" label="Name" rules={[{ required: true, max: 100 }]}>
            <Input placeholder="e.g. CI bootstrap token" />
          </Form.Item>
          <Form.Item name="expiresInDays" label="Expires in (days)" initialValue={90}>
            <InputNumber min={1} max={365} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Save the token"
        open={!!issued}
        onCancel={() => setIssued(null)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setIssued(null)}>
            I've saved it
          </Button>,
        ]}
      >
        <Alert
          type="warning"
          showIcon
          message="This is the only time the token will be shown. Copy and store it now."
          style={{ marginBottom: 16 }}
        />
        <Space.Compact style={{ width: '100%' }}>
          <Input.Password value={issued?.token ?? ''} readOnly />
          <Button icon={<CopyOutlined />} onClick={copyToken}>
            Copy
          </Button>
        </Space.Compact>
      </Modal>
    </AdminPageLayout>
  );
}
