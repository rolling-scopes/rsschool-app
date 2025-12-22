import { SessionProvider } from 'modules/Course/contexts';
import { UserGroupsAdminPage } from 'modules/UserGroupsAdmin';

export default function () {
  return (
    <SessionProvider adminOnly>
      <UserGroupsAdminPage />
    </SessionProvider>
  );
}
