import { useState } from 'react';
import { Button, Card, DatePicker, Form, Input, Table, Tag, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import { AuditLogApi, AuditLogEntryDto, UsersApi } from '@client/api';
import { useActiveCourseContext } from '@client/modules/Course/contexts';
import { AdminPageLayout } from '@client/shared/components/PageLayout';
import { UserSearch } from '@client/shared/components/UserSearch';

const api = new AuditLogApi();
const usersApi = new UsersApi();

async function searchUsers(value: string) {
  const { data } = await usersApi.searchUsers(value, true);
  return data;
}

type Filters = {
  userId?: number;
  tokenId?: string;
  action?: string;
  range?: [Dayjs, Dayjs];
};

const PAGE_SIZE = 50;

export function AuditLogPage() {
  const { courses } = useActiveCourseContext();
  const [filters, setFilters] = useState<Filters>({});
  const [items, setItems] = useState<AuditLogEntryDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = async (nextPage: number, nextFilters: Filters) => {
    setLoading(true);
    try {
      const { data } = await api.getAuditLog(
        nextFilters.userId,
        nextFilters.tokenId,
        nextFilters.action,
        nextFilters.range?.[0]?.toISOString(),
        nextFilters.range?.[1]?.toISOString(),
        nextPage,
        PAGE_SIZE,
      );
      setItems(data.items);
      setTotal(data.meta.total);
      setPage(nextPage);
      setFilters(nextFilters);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageLayout title="Audit log" loading={loading} courses={courses}>
      <Card>
        <Typography.Paragraph type="secondary">
          Records every API call made with a Personal Access Token. Use it to trace what an agent did, when, and via
          which token.
        </Typography.Paragraph>
        <Form
          layout="inline"
          onFinish={values =>
            load(1, {
              userId: values.userId ?? undefined,
              tokenId: values.tokenId || undefined,
              action: values.action || undefined,
              range: values.range,
            })
          }
        >
          <Form.Item name="userId" label="User">
            <UserSearch searchFn={searchUsers} keyField="id" style={{ width: 320 }} />
          </Form.Item>
          <Form.Item name="tokenId" label="Token ID">
            <Input style={{ width: 280 }} />
          </Form.Item>
          <Form.Item name="action" label="Action">
            <Input placeholder="e.g. CertificatesController" />
          </Form.Item>
          <Form.Item name="range" label="Date range">
            <DatePicker.RangePicker showTime />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Search
            </Button>
          </Form.Item>
        </Form>
        <Table<AuditLogEntryDto>
          rowKey="id"
          style={{ marginTop: 16 }}
          dataSource={items}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            onChange: p => load(p, filters),
          }}
          columns={[
            {
              title: 'When',
              dataIndex: 'createdAt',
              render: v => new Date(v).toLocaleString(),
            },
            {
              title: 'User',
              render: (_, r) => (
                <>
                  {r.userGithubId ?? `#${r.userId}`} <Typography.Text type="secondary">({r.userId})</Typography.Text>
                </>
              ),
            },
            { title: 'Token', dataIndex: 'tokenName', render: v => v || <Tag>—</Tag> },
            { title: 'Action', dataIndex: 'action' },
            {
              title: 'Method',
              dataIndex: 'method',
              width: 80,
            },
            { title: 'Path', dataIndex: 'path', ellipsis: true },
            {
              title: 'Status',
              dataIndex: 'responseStatus',
              width: 80,
              render: v => <Tag color={v >= 500 ? 'red' : v >= 400 ? 'orange' : 'green'}>{v}</Tag>,
            },
            { title: 'Duration', dataIndex: 'durationMs', render: v => `${v} ms`, width: 100 },
          ]}
          expandable={{
            expandedRowRender: r => <pre style={{ margin: 0 }}>{JSON.stringify(r.requestPayload, null, 2)}</pre>,
            rowExpandable: r => r.requestPayload != null,
          }}
        />
      </Card>
    </AdminPageLayout>
  );
}
