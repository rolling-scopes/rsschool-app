import { SessionProvider } from '@client/modules/Course/contexts';
import { UserGroupsAdminPage } from '@client/modules/UserGroupsAdmin';

export default function () {
  return (
    <SessionProvider adminOnly>
      <UserGroupsAdminPage />
    </SessionProvider>
  );
}
