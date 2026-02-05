import { Button, Flex, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { DevtoolsApi, DevtoolsUserDto } from '@client/api';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

const devToolsApi = new DevtoolsApi();

export default function DevToolsUsers() {
  const [users, setUsers] = useState<DevtoolsUserDto[]>([]);
  const router = useRouter();

  async function loginWithUser(user: DevtoolsUserDto) {
    try {
      await devToolsApi.getDevUserLogin(user.githubId);
      router.push('/api/v2/auth/github/login');
    } catch {
      console.error('Failed to login user');
    }
  }

  const tableColumns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'githubId',
      dataIndex: 'githubId',
      key: 'githubId',
    },
    {
      title: 'student',
      dataIndex: 'student',
      key: 'student',
      render: (ids: number[]) => <Text>{ids.join(', ')}</Text>,
    },
    {
      title: 'mentor',
      dataIndex: 'mentor',
      key: 'mentor',
      render: (ids: number[]) => <Text>{ids.join(', ')}</Text>,
    },
    {
      title: 'action',
      dataIndex: 'action',
      key: 'action',
      render: (_value: unknown, record: DevtoolsUserDto) => (
        <Button
          type="link"
          onClick={() => loginWithUser(record)}
        >
          Login
        </Button>
      ),
    },
  ];

  useEffect(() => {
    devToolsApi.getDevUsers().then(res => {
      setUsers(res.data);
    }).catch(console.error);
  }, []);

  return (
    <Flex>
      <Table
        style={{ width: '100%' }}
        size="small"
        bordered={false}
        rowKey="id"
        dataSource={users}
        columns={tableColumns}
        pagination={{
          pageSize: 4,
        }}
      ></Table>
    </Flex>
  );
}
