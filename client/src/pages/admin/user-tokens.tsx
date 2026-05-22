import { UserTokensAdminPage } from '@client/modules/ApiTokens';
import { SessionProvider } from '@client/modules/Course/contexts';

export default function () {
  return (
    <SessionProvider adminOnly>
      <UserTokensAdminPage />
    </SessionProvider>
  );
}
