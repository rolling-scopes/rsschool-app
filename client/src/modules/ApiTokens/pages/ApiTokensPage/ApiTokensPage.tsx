import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { CopyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  CreatedPersonalAccessTokenDto,
  CreatePersonalAccessTokenDto,
  PersonalAccessTokenDto,
  PersonalAccessTokensApi,
} from '@client/api';
import { useMessage } from '@client/hooks';
import { PageLayout } from '@client/shared/components/PageLayout';

const api = new PersonalAccessTokensApi();

export function ApiTokensPage() {
  const { message } = useMessage();
  const [tokens, setTokens] = useState<PersonalAccessTokenDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<CreatedPersonalAccessTokenDto | null>(null);
  const [form] = Form.useForm<CreatePersonalAccessTokenDto>();

  const reload = async () => {
    setLoading(true);
    try {
      const { data } = await api.getMyPersonalAccessTokens();
      setTokens(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const onCreate = async (values: CreatePersonalAccessTokenDto) => {
    const { data } = await api.createMyPersonalAccessToken(values);
    setCreated(data);
    setCreating(false);
    form.resetFields();
    void reload();
  };

  const onRevoke = async (id: string) => {
    await api.revokeMyPersonalAccessToken(id);
    void reload();
  };

  const copyToken = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.token);
    message.success('Token copied to clipboard');
  };

  return (
    <PageLayout loading={loading} title="API tokens">
      <Card
        title="Personal access tokens"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
            Create token
          </Button>
        }
      >
        <Typography.Paragraph type="secondary">
          API tokens let MCP-compatible agents (Claude, Cursor, Codex) act on your behalf. The agent inherits your
          permissions. Revoke a token if it leaks.
        </Typography.Paragraph>
        <Table<PersonalAccessTokenDto>
          rowKey="id"
          dataSource={tokens}
          pagination={false}
          columns={[
            { title: 'Name', dataIndex: 'name' },
            { title: 'Prefix', dataIndex: 'prefix', render: v => <code>{v}…</code> },
            {
              title: 'Created',
              dataIndex: 'createdAt',
              render: v => new Date(v).toLocaleString(),
            },
            {
              title: 'Expires',
              dataIndex: 'expiresAt',
              render: v => new Date(v).toLocaleDateString(),
            },
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
      </Card>

      <Modal
        title="Create API token"
        open={creating}
        onCancel={() => setCreating(false)}
        onOk={() => form.submit()}
        okText="Create"
      >
        <Form form={form} layout="vertical" onFinish={onCreate}>
          <Form.Item name="name" label="Name" rules={[{ required: true, max: 100 }]}>
            <Input placeholder="e.g. Claude Desktop on my laptop" />
          </Form.Item>
          <Form.Item name="expiresInDays" label="Expires in (days)" initialValue={90}>
            <InputNumber min={1} max={365} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Save your token"
        open={!!created}
        onCancel={() => setCreated(null)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setCreated(null)}>
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
          <Input.Password value={created?.token ?? ''} readOnly />
          <Button icon={<CopyOutlined />} onClick={copyToken}>
            Copy
          </Button>
        </Space.Compact>
      </Modal>
    </PageLayout>
  );
}
