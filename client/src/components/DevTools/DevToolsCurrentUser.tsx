import { Flex } from 'antd';
import { useContext } from 'react';
import { SessionContext } from '@client/modules/Course/contexts';

export default function DevToolsCurrentUser() {
  const session = useContext(SessionContext);
  return (
    <Flex vertical>
      <ul>
        <li>User ID: {session.id}</li>
        <li>GitHub ID: {session.githubId}</li>
        <li>Admin: {session.isAdmin ? 'true' : 'false'}</li>
        <li>Courses: {Object.keys(session.courses).toString()}</li>
      </ul>
    </Flex>
  );
}
