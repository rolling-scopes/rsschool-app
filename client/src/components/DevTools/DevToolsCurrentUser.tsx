import useRequest from 'ahooks/lib/useRequest';
import { Flex, Typography } from 'antd';
import { SessionApi } from 'api';

const { Text } = Typography;

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
    <Flex vertical>
      <ul>
        <li>User ID: {data.id}</li>
        <li>GitHub ID: {data.githubId}</li>
        <li>Admin: {data.isAdmin ? 'true' : 'false'}</li>
        <li>Courses: {Object.keys(data.courses ?? {}).toString()}</li>
      </ul>
    </Flex>
  );
}
