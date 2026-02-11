import useRequest from 'ahooks/lib/useRequest';
import { Descriptions, Typography } from 'antd';
import { SessionApi } from 'api';

const { Text } = Typography;
const { Item } = Descriptions;

const sessionApi = new SessionApi();

export default function DevToolsCurrentUser() {
  const { data, error } = useRequest(
    async () => {
      const response = await sessionApi.getSession();
      return response.data;
    },
    {
      cacheKey: 'devtools-session',
      staleTime: 1000 * 60 * 5,
    },
  );

  if (error || !data) {
    return <Text type="secondary">No active session</Text>;
  }

  return (
    <Descriptions title="Active user session" layout="vertical" bordered={true}>
      <Item label="User ID">{data?.id}</Item>
      <Item label="GitHub ID">{data?.githubId}</Item>
      <Item label="Admin">{data?.isAdmin ? 'true' : 'false'}</Item>
      <Item label="Course ids">{Object.keys(data?.courses ?? {}).toString()}</Item>
    </Descriptions>
  );
}
