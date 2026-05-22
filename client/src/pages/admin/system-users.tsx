import { SessionProvider } from '@client/modules/Course/contexts';
import { SystemUsersPage } from '@client/modules/SystemUsers';

export default function () {
  return (
    <SessionProvider adminOnly>
      <SystemUsersPage />
    </SessionProvider>
  );
}
