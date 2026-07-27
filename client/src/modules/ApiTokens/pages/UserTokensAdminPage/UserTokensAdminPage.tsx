import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import type { ColumnType, TableProps } from 'antd/es/table';
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
import { getColumnSearchProps } from '@client/shared/components/Table';
import { UserSearch } from '@client/shared/components/UserSearch';
import type { IPaginationInfo } from '@client/shared/utils/pagination';

const api = new PersonalAccessTokensApi();
const usersApi = new UsersApi();

async function searchUsers(value: string) {
  const { data } = await usersApi.searchUsers(value, true);
  return data;
}

const SORT_FIELDS = ['createdAt', 'expiresAt', 'lastUsedAt', 'name', 'githubId'] as const;
type SortField = (typeof SORT_FIELDS)[number];
type Status = 'active' | 'revoked' | 'expired';

type Filters = {
  githubId?: string;
  name?: string;
  issuedBy?: string;
  status?: Status;
};

type Order = { field: SortField; direction: 'asc' | 'desc' };

const DEFAULT_PAGINATION: IPaginationInfo = { current: 1, pageSize: 50 };
const DEFAULT_ORDER: Order = { field: 'createdAt', direction: 'desc' };

// Filtering and sorting happen server-side, so the shared dropdown must not
// also filter the current page locally.
const searchProps = (dataIndex: string, label: string): Partial<ColumnType<PersonalAccessTokenDto>> => ({
  ...getColumnSearchProps<PersonalAccessTokenDto>(dataIndex, label),
  onFilter: undefined,
});

/** antd hands filters back as string arrays; the API takes a single value. */
function firstValue(value: unknown): string | undefined {
  if (Array.isArray(value)) return value.length ? String(value[0]) : undefined;
  return value == null ? undefined : String(value);
}

export function UserTokensAdminPage() {
  const { courses } = useActiveCourseContext();
  const { message } = useMessage();
  const [tokens, setTokens] = useState<PersonalAccessTokenDto[]>([]);
  const [pagination, setPagination] = useState<IPaginationInfo>(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState<Filters>({});
  const [order, setOrder] = useState<Order>(DEFAULT_ORDER);
  const [loading, setLoading] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [issued, setIssued] = useState<CreatedPersonalAccessTokenDto | null>(null);
  const [form] = Form.useForm<CreatePersonalAccessTokenDto & { userId: number }>();

  const load = useCallback(async (page: IPaginationInfo, activeFilters: Filters, activeOrder: Order) => {
    setLoading(true);
    try {
      const { data } = await api.getAllPersonalAccessTokens(
        activeFilters.githubId,
        activeFilters.name,
        activeFilters.issuedBy,
        activeFilters.status,
        activeOrder.field,
        activeOrder.direction,
        page.current,
        page.pageSize,
      );
      setTokens(data.items);
      setPagination({ current: data.meta.current, pageSize: data.meta.pageSize, total: data.meta.total });
      setFilters(activeFilters);
      setOrder(activeOrder);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(DEFAULT_PAGINATION, {}, DEFAULT_ORDER);
  }, [load]);

  const reload = () => load(pagination, filters, order);

  const handleChange: TableProps<PersonalAccessTokenDto>['onChange'] = (nextPagination, nextFilters, sorter) => {
    // antd keys both `filters` and `sorter.columnKey` by the column `key`, which
    // here is deliberately the API parameter name.
    const { columnKey, order: direction } = Array.isArray(sorter) ? sorter[0]! : sorter;
    const field = SORT_FIELDS.find(f => f === columnKey);
    return load(
      { current: nextPagination.current ?? 1, pageSize: nextPagination.pageSize ?? DEFAULT_PAGINATION.pageSize },
      {
        githubId: firstValue(nextFilters.githubId),
        name: firstValue(nextFilters.name),
        issuedBy: firstValue(nextFilters.issuedBy),
        status: firstValue(nextFilters.status) as Status | undefined,
      },
      field && direction ? { field, direction: direction === 'ascend' ? 'asc' : 'desc' } : DEFAULT_ORDER,
    );
  };

  const onRevoke = async (id: string) => {
    await api.revokePersonalAccessTokenAsAdmin(id);
    void reload();
  };

  const onIssue = async ({ userId, ...values }: CreatePersonalAccessTokenDto & { userId: number }) => {
    const { data } = await api.createPersonalAccessTokenForUser(Number(userId), values);
    setIssued(data);
    setIssuing(false);
    form.resetFields();
    void reload();
  };

  const copyToken = async () => {
    if (!issued) return;
    await navigator.clipboard.writeText(issued.token);
    message.success('Token copied');
  };

  const columns: ColumnType<PersonalAccessTokenDto>[] = [
    {
      title: 'Owner',
      dataIndex: 'userGithubId',
      key: 'githubId',
      sorter: true,
      ...searchProps('userGithubId', 'owner'),
      render: (githubId: string | null, record) => githubId ?? `#${record.userId}`,
    },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: true, ...searchProps('name', 'name') },
    { title: 'Prefix', dataIndex: 'prefix', render: v => <code>{v}…</code> },
    {
      title: 'Issued by',
      dataIndex: 'createdByGithubId',
      key: 'issuedBy',
      ...searchProps('createdByGithubId', 'issuer'),
      render: (githubId: string | null, record) => githubId ?? `#${record.createdById}`,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      defaultSortOrder: 'descend',
      render: v => new Date(v).toLocaleString(),
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      sorter: true,
      render: v => new Date(v).toLocaleDateString(),
    },
    {
      title: 'Last used',
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      sorter: true,
      render: v => (v ? new Date(String(v)).toLocaleString() : <Tag>never</Tag>),
    },
    {
      title: 'Status',
      dataIndex: 'revokedAt',
      key: 'status',
      filterMultiple: false,
      filters: [
        { text: 'active', value: 'active' },
        { text: 'revoked', value: 'revoked' },
        { text: 'expired', value: 'expired' },
      ],
      render: (revokedAt, record) => {
        if (revokedAt) return <Tag color="red">revoked</Tag>;
        return new Date(record.expiresAt) <= new Date() ? (
          <Tag color="orange">expired</Tag>
        ) : (
          <Tag color="green">active</Tag>
        );
      },
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
  ];

  return (
    <AdminPageLayout title="User API tokens" loading={loading} courses={courses}>
      <Card>
        <Typography.Paragraph type="secondary">
          Every API token in the system. Search and sort by any column to find a token; use this to bootstrap a service
          account, or to respond to a leaked token.
        </Typography.Paragraph>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button icon={<PlusOutlined />} onClick={() => setIssuing(true)}>
            Issue token
          </Button>
          <Table<PersonalAccessTokenDto>
            rowKey="id"
            dataSource={tokens}
            columns={columns}
            onChange={handleChange}
            pagination={{ ...pagination, showTotal: total => `Total ${total} tokens` }}
            scroll={{ x: 'max-content' }}
          />
        </Space>
      </Card>

      <Modal
        title="Issue token"
        open={issuing}
        onCancel={() => setIssuing(false)}
        onOk={() => form.submit()}
        okText="Issue"
      >
        <Form form={form} layout="vertical" onFinish={onIssue}>
          <Form.Item name="userId" label="User" rules={[{ required: true }]}>
            <UserSearch searchFn={searchUsers} keyField="id" />
          </Form.Item>
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
