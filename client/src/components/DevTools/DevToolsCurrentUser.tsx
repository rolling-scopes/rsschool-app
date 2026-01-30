import { Flex, Typography } from 'antd';

export default function DevToolsCurrentUser() {
  const userId = 123456789;
  return (
    <Flex>
      <Typography.Text>Current user: {userId}</Typography.Text>
    </Flex>
  );
}
