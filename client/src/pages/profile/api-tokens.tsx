import { ApiTokensPage } from '@client/modules/ApiTokens';
import { SessionProvider } from '@client/modules/Course/contexts';

export default function () {
  return (
    <SessionProvider>
      <ApiTokensPage />
    </SessionProvider>
  );
}
