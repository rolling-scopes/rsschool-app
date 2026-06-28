import { SessionProvider } from '@client/modules/Course/contexts';
import { ConnectionConfirmed } from '@client/modules/Notifications/pages/ConnectionConfirmedPage';

function Page() {
  return (
    <SessionProvider>
      <ConnectionConfirmed />
    </SessionProvider>
  );
}

export default Page;
