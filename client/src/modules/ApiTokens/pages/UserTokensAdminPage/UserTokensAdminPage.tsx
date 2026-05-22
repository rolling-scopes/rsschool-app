import { useState } from 'react';
import { Button, Card, Form, InputNumber, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { PersonalAccessTokenDto, PersonalAccessTokensApi } from '@client/api';
import { useActiveCourseContext } from '@client/modules/Course/contexts';
import { AdminPageLayout } from '@client/shared/components/PageLayout';

const api = new PersonalAccessTokensApi();

export function UserTokensAdminPage() {
  const { courses } = useActiveCourseContext();
  const [userId, setUserId] = useState<number | null>(null);
  const [tokens, setTokens] = useState<PersonalAccessTokenDto[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <AdminPageLayout title="User API tokens" loading={loading} courses={courses}>
      <Card>
        <Typography.Paragraph type="secondary">
          View and revoke API tokens of any user, including system accounts. Use this in incident response or when a
          token is suspected to have leaked.
        </Typography.Paragraph>
        <Form layout="inline" onFinish={values => load(Number(values.userId))}>
          <Form.Item name="userId" label="User ID" rules={[{ required: true }]}>
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Load
            </Button>
          </Form.Item>
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
    </AdminPageLayout>
  );
}
